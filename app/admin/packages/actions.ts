'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff, type Staff } from '@/lib/auth'
import { blankPackage, newCode, normalize, publishIssues } from '@/lib/package-rules'
import { packageSchema } from '@/lib/package-schema'
import { createClient } from '@/lib/supabase/server'
import type { PackageContent } from '@/lib/types'

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string }
const fail = (error: string): ActionResult => ({ ok: false, error })
const ROLES = ['admin', 'editor'] as const

/** Validates and saves the draft. The live URL of a published package never changes. */
async function persist(id: string, input: unknown): Promise<{ staff: Staff; content: PackageContent; slug: string } | { error: string }> {
  const staff = await requireStaff([...ROLES])
  const parsed = packageSchema.safeParse(input)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return { error: `Please check "${i.path.join(' > ')}": ${i.message}` }
  }
  const supabase = await createClient()
  const { data: row } = await supabase.from('packages').select('code, slug, published_version_id').eq('id', id).maybeSingle()
  if (!row) return { error: 'Package not found.' }
  const content = normalize(parsed.data as PackageContent, staff.name)
  content.code = row.code
  if (row.published_version_id) content.slug = row.slug
  const { error } = await supabase
    .from('packages')
    .update({ slug: content.slug, draft: content, updated_by: staff.id, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.code === '23505' ? 'That web address is already used by another package.' : 'Could not save. Please try again.' }
  return { staff, content, slug: content.slug }
}

export async function saveDraft(id: string, input: unknown): Promise<ActionResult> {
  const r = await persist(id, input)
  return 'error' in r ? fail(r.error) : { ok: true, message: 'Draft saved.' }
}

export async function publishPackage(id: string, input: unknown, note: string): Promise<ActionResult> {
  const r = await persist(id, input)
  if ('error' in r) return fail(r.error)
  const issues = publishIssues(r.content)
  if (issues.length) return fail(issues[0])
  const supabase = await createClient()
  const { error } = await supabase.rpc('publish_package', { p_package: id, p_note: note.trim().slice(0, 200) || null })
  if (error) return fail('Could not publish. Please try again.')
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Published. The live page updates within a minute.' }
}

export async function schedulePackage(id: string, input: unknown, publishAt: string): Promise<ActionResult> {
  const r = await persist(id, input)
  if ('error' in r) return fail(r.error)
  const issues = publishIssues(r.content)
  if (issues.length) return fail(issues[0])
  const when = new Date(publishAt)
  if (Number.isNaN(when.getTime()) || when.getTime() < Date.now() + 60_000) return fail('Choose a date and time in the future.')
  const supabase = await createClient()
  const { data: row } = await supabase.from('packages').select('published_version_id').eq('id', id).maybeSingle()
  // A package that is already live stays live until the scheduled update goes out.
  const patch = row?.published_version_id ? { publish_at: when.toISOString() } : { publish_at: when.toISOString(), status: 'scheduled' }
  const { error } = await supabase.from('packages').update(patch).eq('id', id)
  if (error) return fail('Could not schedule. Please try again.')
  await supabase.from('activity_log').insert({ actor_id: r.staff.id, action: 'package.schedule', entity: 'package', entity_id: id, detail: { publish_at: when.toISOString() } })
  return { ok: true, message: `Scheduled for ${when.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.` }
}

export async function restoreVersion(versionId: string): Promise<ActionResult> {
  await requireStaff([...ROLES])
  const supabase = await createClient()
  const { error } = await supabase.rpc('restore_version', { p_version: versionId })
  return error ? fail('Could not restore that version.') : { ok: true, message: 'Restored into the draft. Publish to make it live.' }
}

async function insertDraft(content: PackageContent, staff: Staff, action: string, detail: object) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('packages')
    .insert({ code: content.code, slug: content.slug, status: 'draft', draft: content, updated_by: staff.id })
    .select('id')
    .single()
  if (error || !data) throw new Error('Could not create the package')
  await supabase.from('activity_log').insert({ actor_id: staff.id, action, entity: 'package', entity_id: data.id, detail })
  return data.id as string
}

export async function createPackage() {
  const staff = await requireStaff([...ROLES])
  const id = await insertDraft(blankPackage(), staff, 'package.create', {})
  redirect(`/admin/packages/${id}`)
}

export async function duplicatePackage(id: string) {
  const staff = await requireStaff([...ROLES])
  const supabase = await createClient()
  const { data: row } = await supabase.from('packages').select('draft').eq('id', id).maybeSingle()
  if (!row) throw new Error('Package not found')
  const src = row.draft as PackageContent
  const code = newCode()
  const copy: PackageContent = { ...src, code, slug: `${src.slug}-copy-${code.slice(-4).toLowerCase()}`, title: `Copy of ${src.title}`, updatedAt: new Date().toISOString(), updatedBy: staff.name }
  const newId = await insertDraft(copy, staff, 'package.duplicate', { from: src.code })
  redirect(`/admin/packages/${newId}`)
}
