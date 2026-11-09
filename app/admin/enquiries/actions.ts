'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff, type Staff } from '@/lib/auth'
import { buildDraft, suggestPackages } from '@/lib/ai/suggest'
import { extractionSchema, type Extraction } from '@/lib/ai/schema'
import { extractEnquiry, writeIntro } from '@/lib/ai/extract'
import { getPublishedPackages } from '@/lib/data/packages'
import { STATUSES, isUuid } from '@/lib/inbox'
import { deliverReply } from '@/lib/messaging'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string }
const fail = (error: string): ActionResult => ({ ok: false, error })
const ROLES = ['admin', 'consultant'] as const

/*
 * Role rules, enforced here on the server (the buttons in the page are only a convenience):
 *  - Admin: sees every enquiry, assigns and reassigns, changes status, adds notes.
 *  - Consultant: sees enquiries assigned to them plus the unassigned pool, and can take an unassigned one.
 *  - Replies: only the person the enquiry is assigned to can send one.
 * These use the service key, so every action checks the caller first and validates its input.
 */
type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const load = async (id: string): Promise<Row | null> => {
  if (!isUuid(id)) return null
  const { data } = await supabaseAdmin().from('enquiries').select('*').eq('id', id).maybeSingle()
  return data as Row | null
}
const isAssignee = (s: Staff, e: Row) => e.assignee_id === s.id
const canManage = (s: Staff, e: Row) => s.role === 'admin' || isAssignee(s, e)
const canSee = (s: Staff, e: Row) => s.role === 'admin' || e.assignee_id === s.id || e.assignee_id == null

async function log(staff: Staff, action: string, id: string, detail: object = {}) {
  await supabaseAdmin().from('activity_log').insert({ actor_id: staff.id, action, entity: 'enquiry', entity_id: id, detail })
}
const refresh = (id: string) => {
  revalidatePath('/admin/enquiries')
  revalidatePath(`/admin/enquiries/${id}`)
}

export async function assignEnquiry(id: string, assigneeId: string | null): Promise<ActionResult> {
  const staff = await requireStaff([...ROLES])
  const e = await load(id)
  if (!e) return fail('Enquiry not found.')
  const sb = supabaseAdmin()
  if (staff.role === 'consultant') {
    if (assigneeId !== staff.id) return fail('You can only take an enquiry for yourself.')
    if (e.assignee_id && e.assignee_id !== staff.id) return fail('This enquiry is already assigned.')
  } else if (assigneeId) {
    if (!isUuid(assigneeId)) return fail('Choose a consultant.')
    const { data: p } = await sb.from('profiles').select('role').eq('id', assigneeId).maybeSingle()
    if (!p || !['admin', 'consultant'].includes(p.role)) return fail('Choose a consultant or an admin.')
  }
  const { error } = await sb.from('enquiries').update({ assignee_id: assigneeId }).eq('id', id)
  if (error) return fail('Could not assign. Please try again.')
  await log(staff, 'enquiry.assign', id, { assignee: assigneeId })
  refresh(id)
  return { ok: true, message: assigneeId ? 'Assigned.' : 'Unassigned.' }
}

export async function setStatus(id: string, status: string): Promise<ActionResult> {
  const staff = await requireStaff([...ROLES])
  if (!(STATUSES as readonly string[]).includes(status)) return fail('Unknown status.')
  const e = await load(id)
  if (!e) return fail('Enquiry not found.')
  if (!canManage(staff, e)) return fail('Only the assigned person or an admin can change the status.')
  const { error } = await supabaseAdmin().from('enquiries').update({ status }).eq('id', id)
  if (error) return fail('Could not change the status.')
  await log(staff, 'enquiry.status', id, { status })
  refresh(id)
  return { ok: true, message: 'Status updated.' }
}

export async function addNote(id: string, body: string): Promise<ActionResult> {
  const staff = await requireStaff([...ROLES])
  const text = body.trim()
  if (text.length < 1 || text.length > 2000) return fail('Write a note of up to 2000 characters.')
  const e = await load(id)
  if (!e) return fail('Enquiry not found.')
  if (!canManage(staff, e)) return fail('Only the assigned person or an admin can add notes.')
  const { error } = await supabaseAdmin().from('enquiry_notes').insert({ enquiry_id: id, author_id: staff.id, body: text })
  if (error) return fail('Could not save the note.')
  await log(staff, 'enquiry.note', id)
  refresh(id)
  return { ok: true, message: 'Note added.' }
}

/** Builds suggestions and a draft from fields and saves them on the enquiry. Nothing is sent. */
async function saveAnalysis(staff: Staff, e: Row, ex: Extraction, source: 'ai' | 'rules' | 'corrected', intro: string | null) {
  const pkgs = await getPublishedPackages()
  const suggestions = suggestPackages(ex, pkgs)
  const draft = buildDraft({ name: String(e.name ?? ''), ex, suggestions, intro, consultant: staff.name })
  const { error } = await supabaseAdmin()
    .from('enquiries')
    .update({ extracted: ex, ai_suggestions: suggestions, ai_draft: draft, ai_source: source, ai_at: new Date().toISOString() })
    .eq('id', e.id)
  return error
}

/** Reads the message, fills in the fields, picks three packages and drafts a reply for a person to review. */
export async function runAiAssist(id: string): Promise<ActionResult> {
  const staff = await requireStaff([...ROLES])
  const e = await load(id)
  if (!e) return fail('Enquiry not found.')
  if (!canSee(staff, e)) return fail('This enquiry is assigned to someone else.')
  const known = [...new Set((await getPublishedPackages()).flatMap((p) => p.destinations))]
  const { data: ex, source } = await extractEnquiry(String(e.message ?? ''), known)
  const intro = source === 'ai' ? await writeIntro(String(e.message ?? '')) : null
  const error = await saveAnalysis(staff, e, ex, source, intro)
  if (error) return fail('Could not save the analysis. Has migration 003 been run?')
  await log(staff, 'enquiry.ai', id, { source })
  refresh(id)
  return { ok: true, message: source === 'ai' ? 'Analysed with AI. Check the fields before you use the draft.' : 'Analysed with the built-in rules (no AI key set, or the AI did not answer). Check the fields before you use the draft.' }
}

/** A consultant corrected the extracted fields. Suggestions and draft are rebuilt from the corrected fields. */
export async function saveCorrections(id: string, input: unknown): Promise<ActionResult> {
  const staff = await requireStaff([...ROLES])
  const parsed = extractionSchema.safeParse(input)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return fail(`Please check "${i.path.join(' > ')}": ${i.message}`)
  }
  const e = await load(id)
  if (!e) return fail('Enquiry not found.')
  if (!canManage(staff, e)) return fail('Only the assigned person or an admin can correct these fields.')
  const error = await saveAnalysis(staff, e, parsed.data, 'corrected', null)
  if (error) return fail('Could not save the corrections.')
  await log(staff, 'enquiry.correct', id)
  refresh(id)
  return { ok: true, message: 'Fields saved. Suggestions and draft updated.' }
}

/** The consultant accepting the draft (or their own text). Only the assigned person can send. */
export async function sendReply(id: string, body: string): Promise<ActionResult> {
  const staff = await requireStaff([...ROLES])
  const text = body.trim()
  if (text.length < 5 || text.length > 4000) return fail('Write a reply of 5 to 4000 characters.')
  const e = await load(id)
  if (!e) return fail('Enquiry not found.')
  if (!isAssignee(staff, e)) return fail('Only the person this enquiry is assigned to can reply. Take it first.')
  const sb = supabaseAdmin()
  const d = await deliverReply({ whatsappConsent: !!e.whatsapp_consent, phone: String(e.phone ?? '') }, text)
  const { error } = await sb.from('enquiry_replies').insert({ enquiry_id: id, author_id: staff.id, direction: 'outbound', body: text, channel: d.channel, delivery: d.status })
  if (error) return fail('Could not send the reply. Has migration 003 been run?')
  const patch: Row = {}
  if (e.status === 'new') patch.status = 'contacted'
  if (!e.first_response_at) patch.first_response_at = new Date().toISOString()
  if (Object.keys(patch).length) await sb.from('enquiries').update(patch).eq('id', id)
  await log(staff, 'enquiry.reply', id, { delivery: d.status })
  refresh(id)
  return { ok: true, message: e.whatsapp_consent ? 'Sent. The traveller can read it on their enquiry page; WhatsApp is queued (mock).' : 'Sent. The traveller can read it on their enquiry page.' }
}
