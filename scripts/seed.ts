/**
 * Seeds demo staff, packages (with published versions) and sample enquiries.
 * Run: npm run seed   (needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_PASSWORD in .env.local)
 * Safe to re-run: it resets the sample data. Do not run against real data.
 * Everything here is fictional: no real people, phones or emails.
 */
import { createClient } from '@supabase/supabase-js'
import { enquiries, packages } from '../lib/mock-data'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const password = process.env.DEMO_PASSWORD
if (!url || !key || !password) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and DEMO_PASSWORD in .env.local')
  process.exit(1)
}
const sb = createClient(url, key, { auth: { persistSession: false } })

function check(label: string, error: { message: string } | null) {
  if (error) {
    console.error(`FAILED: ${label}: ${error.message}`)
    process.exit(1)
  }
}

const staff = [
  { key: 'rakesh', email: 'rakesh.admin@example.com', name: 'Rakesh Honawad', role: 'admin' },
  { key: 'devika', email: 'devika.editor@example.com', name: 'Devika Rao', role: 'editor' },
  { key: 'arun', email: 'arun.consultant@example.com', name: 'Arun Pillai', role: 'consultant' },
]

async function seedStaff() {
  const ids: Record<string, string> = {}
  const { data: list, error: le } = await sb.auth.admin.listUsers({ perPage: 200 })
  check('list users', le)
  for (const s of staff) {
    let id = list!.users.find((u) => u.email === s.email)?.id
    if (!id) {
      const { data, error } = await sb.auth.admin.createUser({ email: s.email, password, email_confirm: true })
      check(`create ${s.email}`, error)
      id = data.user!.id
    } else {
      const { error } = await sb.auth.admin.updateUserById(id, { password })
      check(`reset password ${s.email}`, error)
    }
    const { error } = await sb.from('profiles').upsert({ id, full_name: s.name, role: s.role })
    check(`profile ${s.email}`, error)
    ids[s.key] = id
  }
  return ids
}

async function seedPackages(adminId: string) {
  for (const p of packages) {
    const { status, ...content } = p
    const { data: pkg, error } = await sb
      .from('packages')
      .upsert(
        {
          code: p.code,
          slug: p.slug,
          status,
          draft: content,
          updated_by: adminId,
          updated_at: p.updatedAt,
          publish_at: status === 'scheduled' ? new Date(Date.now() + 7 * 864e5).toISOString() : null,
        },
        { onConflict: 'code' },
      )
      .select('id')
      .single()
    check(`package ${p.code}`, error)
    if (status !== 'published') continue

    const { data: existing } = await sb.from('package_versions').select('id').eq('package_id', pkg!.id).eq('version_no', 1).maybeSingle()
    let versionId = existing?.id
    if (versionId) {
      const { error: ue } = await sb.from('package_versions').update({ content }).eq('id', versionId)
      check(`refresh version ${p.code}`, ue)
    } else {
      const { data: v, error: ve } = await sb
        .from('package_versions')
        .insert({ package_id: pkg!.id, version_no: 1, content, note: 'Initial version', created_by: adminId })
        .select('id')
        .single()
      check(`version ${p.code}`, ve)
      versionId = v!.id
      const { error: ae } = await sb
        .from('activity_log')
        .insert({ actor_id: adminId, action: 'package.publish', entity: 'package', entity_id: pkg!.id, detail: { version: 1, note: 'Initial version' } })
      check(`activity ${p.code}`, ae)
    }
    const { error: pe } = await sb.from('packages').update({ published_version_id: versionId }).eq('id', pkg!.id)
    check(`publish ${p.code}`, pe)
  }
}

async function seedEnquiries(ids: Record<string, string>) {
  const channel: Record<string, string> = { 'Web form': 'web', WhatsApp: 'whatsapp', Email: 'email', Phone: 'phone', Chat: 'chat' }
  const assignee: Record<string, string | undefined> = { Rakesh: ids.rakesh, Arun: ids.arun }
  const minutesAgo = [35, 140, 1560, 1700, 4300]
  const { error: de } = await sb.from('enquiries').delete().like('phone', '+91 90000 0000%')
  check('clear old sample enquiries', de)
  const rows = enquiries.map((e, i) => ({
    name: e.name,
    phone: `+91 90000 0000${i + 1}`,
    channel: channel[e.channel] ?? 'web',
    message: e.preview,
    status: e.status.toLowerCase(),
    assignee_id: assignee[e.assignee] ?? null,
    whatsapp_consent: e.channel === 'WhatsApp',
    consent_at: e.channel === 'WhatsApp' ? new Date().toISOString() : null,
    created_at: new Date(Date.now() - minutesAgo[i] * 60000).toISOString(),
  }))
  const { data, error } = await sb.from('enquiries').insert(rows).select('id, name')
  check('insert enquiries', error)
  const first = data!.find((r) => r.name === 'Ananya Menon')
  if (first) {
    const { error: ne } = await sb.from('enquiry_notes').insert({ enquiry_id: first.id, author_id: ids.rakesh, body: 'Called once, no answer. Will try again at 4pm.' })
    check('note', ne)
  }
}

async function main() {
  const ids = await seedStaff()
  await seedPackages(ids.rakesh)
  await seedEnquiries(ids)
  console.log('Seeded: 3 staff, %d packages, %d enquiries', packages.length, enquiries.length)
  console.log('Demo logins: rakesh.admin@example.com, devika.editor@example.com, arun.consultant@example.com')
}
main()
