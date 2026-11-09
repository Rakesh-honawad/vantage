import type { Metadata } from 'next'
import { requireStaff } from '@/lib/auth'
import { enquiryRef, STATUS_LABEL } from '@/lib/inbox'
import { timeAgo } from '@/lib/format'
import { supabaseAdmin } from '@/lib/supabase/admin'
import '../../inbox.css'

export const metadata: Metadata = { title: 'Activity' }
export const dynamic = 'force-dynamic'

type D = Record<string, unknown>
function describe(action: string, entity: string, entityId: string, d: D): string {
  const ref = entity === 'enquiry' ? enquiryRef(entityId) : `package ${entityId.slice(0, 6)}`
  switch (action) {
    case 'package.publish': return `Published ${ref}${d.version ? `, version ${d.version}` : ''}${d.note ? ` (${d.note})` : ''}`
    case 'package.schedule': return `Scheduled ${ref}`
    case 'package.create': return `Created ${ref}`
    case 'package.duplicate': return `Duplicated ${d.from ?? ref}`
    case 'enquiry.assign': return d.assignee ? `Assigned ${ref}` : `Unassigned ${ref}`
    case 'enquiry.status': return `Set ${ref} to ${STATUS_LABEL[String(d.status)] ?? d.status}`
    case 'enquiry.note': return `Added a note to ${ref}`
    case 'enquiry.ai': return `Ran AI assist on ${ref}`
    case 'enquiry.correct': return `Corrected the extracted fields on ${ref}`
    case 'enquiry.reply': return `Replied to ${ref}`
    default: return `${action} on ${ref}`
  }
}

export default async function ActivityPage() {
  await requireStaff(['admin'])
  const sb = supabaseAdmin()
  const [{ data, error }, { data: people }] = await Promise.all([
    sb.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100),
    sb.from('profiles').select('id, full_name'),
  ])
  const names = new Map((people ?? []).map((p) => [p.id as string, p.full_name as string]))
  return (
    <>
      <div className="admin-title">
        <div><span className="eyebrow">Audit</span><h1>Activity</h1><p className="admin-sub">The latest 100 actions by staff and by the scheduler.</p></div>
      </div>
      {error || !data?.length ? (
        <div className="admin-empty"><h3>No activity yet.</h3><p>Publishing, assigning and replying are recorded here.</p></div>
      ) : (
        <ul className="ib-activity">
          {data.map((a, i) => (
            <li key={String(a.id ?? i)}>
              <span>{describe(String(a.action), String(a.entity ?? ''), String(a.entity_id ?? ''), (a.detail ?? {}) as D)}</span>
              <small>{a.actor_id ? names.get(a.actor_id as string) ?? 'Staff' : 'Scheduler'}, {a.created_at ? timeAgo(a.created_at as string) : ''}</small>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
