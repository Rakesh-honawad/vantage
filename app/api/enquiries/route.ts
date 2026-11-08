import { NextResponse } from 'next/server'
import { z } from 'zod'

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

export async function POST(req: Request) {
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
  // Phase 2: insert into Supabase (enquiries table) and record consent time.
  return NextResponse.json({ ok: true, id: crypto.randomUUID(), acknowledgement: acknowledgement(d.name) }, { status: 201 })
}
