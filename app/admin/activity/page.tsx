import type { Metadata } from 'next'
import Link from 'next/link'
import { requireStaff } from '@/lib/auth'
import { formatIST } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Activity' }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Log = { id: string; action: string; entity: string; entity_id: string | null; detail: Record<string, unknown> | null; created_at: string; actor: { full_name: string } | null }

function sentence(l: Log, title: string | undefined): string {
  const d = l.detail ?? {}
  const what = title ? `"${title}"` : 'a package'
  switch (l.action) {
    case 'package.publish': return `Published ${what}${d.version ? `, version ${d.version}` : ''}${d.note ? ` (${d.note})` : ''}`
    case 'package.restore': return `Restored version ${d.from_version} of ${what} into the draft`
    case 'package.schedule': return `Scheduled ${what} to go live`
    case 'package.create': return `Created ${what}`
    case 'package.duplicate': return `Duplicated ${d.from ?? 'a package'} as ${what}`
    case 'enquiry.status': return `Moved an enquiry from ${d.from} to ${d.to}`
    case 'enquiry.assign': return d.to ? 'Assigned an enquiry' : 'Unassigned an enquiry'
    default: return l.action
  }
}

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  await requireStaff(['admin'])
  const { who } = await searchParams
  const supabase = await createClient()
  let q = supabase.from('activity_log').select('id, action, entity, entity_id, detail, created_at, actor:profiles(full_name)').order('created_at', { ascending: false }).limit(100)
  if (who && UUID.test(who)) q = q.eq('actor_id', who)
  const [{ data, error }, { data: people }] = await Promise.all([q, supabase.from('profiles').select('id, full_name').order('full_name')])
  if (error) throw new Error(`Could not load activity: ${error.message}`)
  const logs = (data ?? []) as unknown as Log[]

  const pkgIds = [...new Set(logs.filter((l) => l.entity === 'package' && l.entity_id).map((l) => l.entity_id as string))]
  const titles = new Map<string, string>()
  if (pkgIds.length) {
    const { data: pk } = await supabase.from('packages').select('id, title:draft->>title').in('id', pkgIds)
    ;(pk ?? []).forEach((p) => titles.set(p.id as string, (p as unknown as { title: string }).title))
  }

  return (
    <>
      <div className="admin-title"><div><span className="eyebrow">Workspace history</span><h1>Activity</h1></div></div>
      <form className="inbox-filters" method="get">
        <select name="who" defaultValue={who ?? ''} aria-label="Person"><option value="">Everyone</option>{(people ?? []).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select>
        <button type="submit" className="btn btn-outline">Apply</button>
        <Link href="/admin/activity" className="clear-link">Clear</Link>
      </form>
      {logs.length === 0 ? (
        <div className="admin-empty"><h3>Nothing yet.</h3><p>Publishing, restoring and enquiry changes will appear here.</p></div>
      ) : (
        <div className="log">
          {logs.map((l) => (
            <div className="log-row" key={l.id}>
              <span className="dot" aria-hidden="true" />
              <div>
                <strong>{l.actor?.full_name ?? 'System'}</strong>
                <p>
                  {l.entity === 'package' && l.entity_id ? <Link href={`/admin/packages/${l.entity_id}`}>{sentence(l, titles.get(l.entity_id))}</Link> : sentence(l, undefined)}
                </p>
              </div>
              <span className="log-time">{formatIST(l.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
