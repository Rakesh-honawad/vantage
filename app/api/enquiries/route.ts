import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  message: z.string().trim().min(10, 'Tell us a little more about your trip').max(2000, 'Please keep this under 2000 characters'),
  name: z.string().trim().min(2, 'Enter your name').max(80),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{8,15}$/, 'Enter a valid phone number'),
  whatsappConsent: z.boolean(),
  packageCode: z.string().max(40).optional(),
  website: z.string().optional(), // honeypot: real people leave this empty
})

// Fixed template, no AI. Working hours are an ASSUMPTION (label it in the TDD).
const acknowledgement = (name: string) =>
  `Thank you, ${name}. We have your enquiry and a consultant will reply within the hour during working hours (9am to 7pm IST).`

// Best-effort limit per address. In-memory, so it resets on restart and is per server instance.
const hits = new Map<string, number[]>()
function tooMany(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > 8
}

/** Gives a new enquiry to the consultant with the fewest open enquiries. Never blocks or fails the submission. */
async function autoAssign(enquiryId: string) {
  try {
    const sb = supabaseAdmin()
    const { data: team } = await sb.from('profiles').select('id').eq('role', 'consultant')
    if (!team?.length) return
    const ids = team.map((t) => t.id as string)
    const { data: open } = await sb.from('enquiries').select('assignee_id').in('assignee_id', ids).in('status', ['new', 'contacted', 'quoted'])
    const load = new Map(ids.map((i) => [i, 0]))
    for (const o of open ?? []) load.set(o.assignee_id as string, (load.get(o.assignee_id as string) ?? 0) + 1)
    const pick = [...load.entries()].sort((a, b) => a[1] - b[1])[0][0]
    await sb.from('enquiries').update({ assignee_id: pick }).eq('id', enquiryId).is('assignee_id', null)
  } catch {
    // The enquiry stays in the unassigned pool and an admin or consultant can pick it up.
  }
}

export async function POST(req: Request) {
  // Only limit when the host tells us the visitor's address. Locally there is none, and every test would share one bucket.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()
  if (ip && tooMany(ip)) return NextResponse.json({ errors: { form: 'Too many enquiries. Please try again in a few minutes.' } }, { status: 429 })

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 400 })
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!(key in errors)) errors[key] = issue.message
    }
    return NextResponse.json({ errors }, { status: 400 })
  }
  const d = parsed.data
  if (d.website) return NextResponse.json({ ok: true, acknowledgement: acknowledgement(d.name) }) // bot: pretend success, store nothing

  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('enquiries')
    .insert({
      name: d.name,
      phone: d.phone,
      message: d.message,
      package_code: d.packageCode ?? null,
      channel: 'web',
      whatsapp_consent: d.whatsappConsent,
      consent_at: d.whatsappConsent ? new Date().toISOString() : null,
    })
    .select('id')
    .single()
  if (error) {
    console.error('enquiry insert failed:', error.message) // message only, never the traveller's details
    return NextResponse.json({ errors: { form: 'Could not save your enquiry' } }, { status: 500 })
  }

  await autoAssign(data.id as string)

  // The private link for replies. Looked up separately so a missing migration cannot break the form.
  let trackPath: string | undefined
  try {
    const { data: t } = await sb.from('enquiries').select('public_token').eq('id', data.id).maybeSingle()
    if (t?.public_token) trackPath = `/enquiry/${t.public_token}`
  } catch {
    // no link until migration 003 is applied
  }
  return NextResponse.json({ ok: true, id: data.id, trackPath, acknowledgement: acknowledgement(d.name) }, { status: 201 })
}
