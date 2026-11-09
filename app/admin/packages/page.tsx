import type { Metadata } from 'next'
import Link from 'next/link'
import { Btn } from '@/components/site/btn'
import { requireStaff } from '@/lib/auth'
import { timeAgo } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import { createPackage } from './actions'

export const metadata: Metadata = { title: 'Packages' }

type Row = {
  id: string
  code: string
  status: 'draft' | 'scheduled' | 'published'
  publish_at: string | null
  updated_at: string
  title: string | null
  days: string | null
  stars: string | null
  updater: { full_name: string } | null
}

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export default async function AdminPackages() {
  await requireStaff(['admin', 'editor'])
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('packages')
    .select('id, code, status, publish_at, updated_at, title:draft->>title, days:draft->>days, stars:draft->>hotelStars, updater:profiles(full_name)')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(`Could not load packages: ${error.message}`)
  const rows = (data ?? []) as unknown as Row[]

  return (
    <>
      <div className="admin-title">
        <div><span className="eyebrow">Content studio</span><h1>Packages</h1></div>
        <form action={createPackage}><Btn type="submit">New package</Btn></form>
      </div>
      {rows.length === 0 ? (
        <div className="admin-empty"><h3>No packages yet.</h3><p>Choose New package to add your first one.</p></div>
      ) : (
        <div className="admin-table">
          <div className="table-head"><span>Package</span><span>Status</span><span>Last edited</span><span>Updated by</span><span /></div>
          {rows.map((r) => (
            <Link key={r.id} href={`/admin/packages/${r.id}`} className="table-row">
              <div>
                <strong>{r.title || r.code}</strong>
                <small>{r.code} &middot; {r.days} days &middot; {r.stars} star</small>
              </div>
              <span className={`status ${r.status}`}>
                {r.status}
                {r.publish_at && r.status === 'scheduled' ? ` ${day(r.publish_at)}` : ''}
                {r.publish_at && r.status === 'published' ? ` \u00b7 update ${day(r.publish_at)}` : ''}
              </span>
              <span>{timeAgo(r.updated_at)}</span>
              <span>{r.updater?.full_name ?? 'Unknown'}</span>
              <span aria-hidden="true">&#8599;</span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
