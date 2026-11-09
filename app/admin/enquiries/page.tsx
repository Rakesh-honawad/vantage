import type { Metadata } from 'next'
import Link from 'next/link'
import { requireStaff } from '@/lib/auth'
import { CHANNEL_LABEL, STATUS_LABEL, enquiryRef, slaFor } from '@/lib/inbox'
import { supabaseAdmin } from '@/lib/supabase/admin'
import '../../inbox.css'

export const metadata: Metadata = { title: 'Enquiries' }
export const dynamic = 'force-dynamic'

const VIEWS = [
  ['open', 'Open'],
  ['mine', 'Mine'],
  ['unassigned', 'Unassigned'],
  ['closed', 'Won and lost'],
  ['all', 'All'],
] as const

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const staff = await requireStaff(['admin', 'consultant'])
  const sp = await searchParams
  const view = VIEWS.some(([v]) => v === sp.view) ? (sp.view as string) : 'open'
  const sb = supabaseAdmin()

  let q = sb
    .from('enquiries')
    .select('id, name, channel, message, status, assignee_id, created_at, first_response_at')
    .order('created_at', { ascending: false })
    .limit(200)
  // A consultant only ever receives their own enquiries and the unassigned pool.
  if (staff.role === 'consultant') q = q.or(`assignee_id.eq.${staff.id},assignee_id.is.null`)
  if (view === 'open') q = q.not('status', 'in', '(won,lost)') // anything not closed counts as open, whatever the default status word is
  if (view === 'closed') q = q.in('status', ['won', 'lost'])
  if (view === 'mine') q = q.eq('assignee_id', staff.id)
  if (view === 'unassigned') q = q.is('assignee_id', null)
  // Total this person may see, ignoring the tab, so an empty tab can say "there are N in All".
  let cq = sb.from('enquiries').select('id', { count: 'exact', head: true })
  if (staff.role === 'consultant') cq = cq.or(`assignee_id.eq.${staff.id},assignee_id.is.null`)
  const [{ data, error }, { data: people }, { count: total }] = await Promise.all([q, sb.from('profiles').select('id, full_name'), cq])

  if (error) {
    return (
      <div className="admin-title">
        <div>
          <span className="eyebrow">Inbox</span>
          <h1>Enquiries</h1>
          <p className="admin-sub">The inbox needs one database update. Run supabase/migrations/003_inbox.sql in the Supabase SQL editor, then reload.</p>
        </div>
      </div>
    )
  }
  const names = new Map((people ?? []).map((p) => [p.id as string, p.full_name as string]))
  const rows = data ?? []

  return (
    <>
      <div className="admin-title">
        <div>
          <span className="eyebrow">Inbox</span>
          <h1>Enquiries</h1>
          <p className="admin-sub">
            {staff.role === 'admin' ? 'You can see every enquiry and assign it to a consultant.' : 'You see enquiries assigned to you and the unassigned pool. Open one to take it.'} Replies are due within the hour.
          </p>
        </div>
      </div>
      <nav className="ib-views" aria-label="Filter enquiries">
        {VIEWS.map(([v, label]) => (
          <Link key={v} href={`/admin/enquiries?view=${v}`} className={v === view ? 'on' : ''} aria-current={v === view ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <div className="admin-empty">
          <h3>Nothing in this tab.</h3>
          {(total ?? 0) > 0 && view !== 'all' ? (
            <p>There {total === 1 ? 'is 1 enquiry' : `are ${total} enquiries`} in total. <Link href="/admin/enquiries?view=all" className="link-btn">Show all</Link></p>
          ) : staff.role === 'consultant' ? (
            <p>Nothing is assigned to you yet. New website enquiries are given to the consultant with the fewest open ones.</p>
          ) : (
            <p>No enquiries have been saved yet. Send one from the website&apos;s Enquire page and it appears here.</p>
          )}
        </div>
      ) : (
        <ul className="ib-list">
          {rows.map((r) => {
            const sla = slaFor(r.created_at as string, (r.first_response_at as string | null) ?? null, r.status as string)
            return (
              <li key={r.id as string}>
                <Link href={`/admin/enquiries/${r.id}`} className="ib-row">
                  <div className="ib-who">
                    <strong>{r.name as string}</strong>
                    <small>{enquiryRef(r.id as string)}, {CHANNEL_LABEL[r.channel as string] ?? r.channel}</small>
                  </div>
                  <p className="ib-preview">{r.message as string}</p>
                  <span className="ib-assignee">{r.assignee_id ? names.get(r.assignee_id as string) ?? 'Unknown' : 'Unassigned'}</span>
                  <span className="ib-pill" data-s={r.status as string}>{STATUS_LABEL[r.status as string] ?? r.status}</span>
                  <span className={`ib-sla${sla.overdue ? ' late' : ''}${sla.done ? ' done' : ''}`}>{sla.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
