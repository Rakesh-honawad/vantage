import type { Metadata } from 'next'
import Link from 'next/link'
import { SlaChip } from '@/components/admin/sla-chip'
import { requireStaff } from '@/lib/auth'
import { timeAgo } from '@/lib/format'
import { slaState } from '@/lib/sla'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Enquiries' }

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const
const CHANNELS: Record<string, string> = { web: 'Web form', whatsapp: 'WhatsApp', email: 'Email', phone: 'Phone', chat: 'Chat' }
const pick = (v: string | string[] | undefined, allowed: readonly string[]) => {
  const s = Array.isArray(v) ? v[0] : v
  return s && allowed.includes(s) ? s : undefined
}

type Row = { id: string; name: string; channel: string; message: string; status: string; created_at: string; reply_sent_at: string | null; assignee: { full_name: string } | null }

export default async function Inbox({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const staff = await requireStaff(['admin', 'consultant'])
  const sp = await searchParams
  const status = pick(sp.status, STATUSES)
  const channel = pick(sp.channel, Object.keys(CHANNELS))
  const who = pick(sp.who, ['mine', 'unassigned'])

  const supabase = await createClient()
  let q = supabase
    .from('enquiries')
    .select('id, name, channel, message, status, created_at, reply_sent_at, assignee:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (status) q = q.eq('status', status)
  if (channel) q = q.eq('channel', channel)
  if (who === 'mine') q = q.eq('assignee_id', staff.id)
  if (who === 'unassigned') q = q.is('assignee_id', null)
  const { data, error } = await q
  if (error) throw new Error(`Could not load enquiries: ${error.message}`)
  const rows = (data ?? []) as unknown as Row[]

  const now = new Date()
  const states = rows.map((r) => slaState({ createdAt: r.created_at, repliedAt: r.reply_sent_at, status: r.status }, now))
  const open = rows.filter((r) => ['new', 'contacted', 'quoted'].includes(r.status)).length
  const overdue = states.filter((s) => s.kind === 'breached').length

  return (
    <>
      <div className="admin-title">
        <div><span className="eyebrow">Inbox &middot; {open} open &middot; {overdue} overdue</span><h1>Enquiries</h1></div>
      </div>
      <form className="inbox-filters" method="get">
        <select name="status" defaultValue={status ?? ''} aria-label="Status"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select name="channel" defaultValue={channel ?? ''} aria-label="Channel"><option value="">All channels</option>{Object.entries(CHANNELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="who" defaultValue={who ?? ''} aria-label="Owner"><option value="">Everyone</option><option value="mine">Assigned to me</option><option value="unassigned">Unassigned</option></select>
        <button type="submit" className="btn btn-outline">Apply</button>
        <Link href="/admin/enquiries" className="clear-link">Clear</Link>
      </form>
      {rows.length === 0 ? (
        <div className="admin-empty"><h3>No enquiries match.</h3><p>Try clearing the filters.</p></div>
      ) : (
        <div className="inbox">
          {rows.map((r, i) => (
            <Link key={r.id} href={`/admin/enquiries/${r.id}`} className={`inquiry ${r.status === 'new' ? 'unread' : ''}`}>
              <span className="channel" aria-hidden="true">{(CHANNELS[r.channel] ?? r.channel).charAt(0)}</span>
              <div>
                <strong>{r.name}</strong>
                <p>{r.message}</p>
                <SlaChip state={states[i]} />
              </div>
              <span className={`status ${r.status}`}>{r.status}</span>
              <span className="assignee">{r.assignee?.full_name ?? 'Unassigned'}<small>{timeAgo(r.created_at)}</small></span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
