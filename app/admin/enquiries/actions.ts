'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const ROLES = ['admin', 'consultant'] as const
const back = (id: string, q: string) => redirect(`/admin/enquiries/${id}?${q}`)

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']),
  assignee: z.union([z.literal(''), z.string().uuid()]),
})

export async function updateEnquiry(formData: FormData) {
  const staff = await requireStaff([...ROLES])
  const parsed = updateSchema.safeParse({ id: formData.get('id'), status: formData.get('status'), assignee: formData.get('assignee') ?? '' })
  if (!parsed.success) return redirect('/admin/enquiries')
  const { id, status, assignee } = parsed.data
  if (staff.role === 'consultant' && assignee && assignee !== staff.id) return back(id, 'e=' + encodeURIComponent('You can assign an enquiry to yourself or leave it unassigned.'))

  const supabase = await createClient()
  const { data: current } = await supabase.from('enquiries').select('status, assignee_id, reply_sent_at').eq('id', id).maybeSingle()
  if (!current) return back(id, 'e=' + encodeURIComponent('Enquiry not found.'))

  const patch: Record<string, unknown> = { status, assignee_id: assignee || null }
  // The first time an enquiry leaves "new" is its first response, which stops the one-hour clock.
  if (current.status === 'new' && status !== 'new' && !current.reply_sent_at) patch.reply_sent_at = new Date().toISOString()
  const { error } = await supabase.from('enquiries').update(patch).eq('id', id)
  if (error) return back(id, 'e=' + encodeURIComponent('Could not save. Please try again.'))

  const log = (action: string, detail: object) => supabase.from('activity_log').insert({ actor_id: staff.id, action, entity: 'enquiry', entity_id: id, detail })
  if (current.status !== status) await log('enquiry.status', { from: current.status, to: status })
  if ((current.assignee_id ?? '') !== assignee) await log('enquiry.assign', { to: assignee || null })
  revalidatePath('/admin/enquiries')
  return back(id, 'ok=1')
}

const noteSchema = z.object({ id: z.string().uuid(), body: z.string().trim().min(1).max(2000) })

export async function addNote(formData: FormData) {
  const staff = await requireStaff([...ROLES])
  const parsed = noteSchema.safeParse({ id: formData.get('id'), body: formData.get('body') })
  if (!parsed.success) return back(String(formData.get('id') ?? ''), 'e=' + encodeURIComponent('Write a note before saving.'))
  const supabase = await createClient()
  const { error } = await supabase.from('enquiry_notes').insert({ enquiry_id: parsed.data.id, author_id: staff.id, body: parsed.data.body })
  if (error) return back(parsed.data.id, 'e=' + encodeURIComponent('Could not save the note.'))
  return back(parsed.data.id, 'ok=1')
}
