import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SlaChip } from '@/components/admin/sla-chip'
import { requireStaff } from '@/lib/auth'
import { formatIST } from '@/lib/format'
import { slaState } from '@/lib/sla'
import { createClient } from '@/lib/supabase/server'
import { addNote, updateEnquiry } from '../actions'

export const metadata: Metadata = { title: 'Enquiry' }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CHANNELS: Record<string, string> = { web: 'Web form', whatsapp: 'WhatsApp', email: 'Email', phone: 'Phone', chat: 'Chat' }
const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost']

export default async function EnquiryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; e?: string }> }) {
  const staff = await requireStaff(['admin', 'consultant'])
  const { id } = await params
  if (!UUID.test(id)) notFound()
  const sp = await searchParams
  const supabase = await createClient()
  const [{ data: e }, { data: notes }, { data: people }] = await Promise.all([
    supabase.from('enquiries').select('*, assignee:profiles(full_name)').eq('id', id).maybeSingle(),
    supabase.from('enquiry_notes').select('id, body, created_at, author:profiles(full_name)').eq('enquiry_id', id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, role').in('role', ['admin', 'consultant']).order('full_name'),
  ])
  if (!e) notFound()

  const sla = slaState({ createdAt: e.created_at, repliedAt: e.reply_sent_at, status: e.status })
  const owners = staff.role === 'admin' ? (people ?? []) : (people ?? []).filter((p) => p.id === staff.id)

  return (
    <>
      <div className="admin-title">
        <div>
          <Link href="/admin/enquiries" className="clear-link">All enquiries</Link>
          <h1>{e.name}</h1>
          <p className="admin-sub">{CHANNELS[e.channel] ?? e.channel} &middot; received {formatIST(e.created_at)} &middot; <SlaChip state={sla} /></p>
        </div>
      </div>
      {sp.ok && <p className="editor-msg" role="status">Saved.</p>}
      {sp.e && <p className="form-error editor-msg" role="alert">{sp.e}</p>}

      <div className="enq-grid">
        <div className="enq-col">
          <section className="panel"><h3>Message</h3><p className="msg">{e.message}</p></section>
          <section className="panel">
            <h3>Contact</h3>
            <p><a href={`tel:${String(e.phone).replace(/\s/g, '')}`}>{e.phone}</a>{e.email ? <> &middot; {e.email}</> : null}</p>
            <p className={e.whatsapp_consent ? 'consent yes' : 'consent no'}>
              {e.whatsapp_consent ? `Agreed to WhatsApp follow-ups${e.consent_at ? ` on ${formatIST(e.consent_at)}` : ''}.` : 'No WhatsApp consent. Contact by phone or email only.'}
            </p>
            {e.package_code && <p className="admin-sub">Asked about {e.package_code}</p>}
          </section>
        </div>

        <div className="enq-col">
          <section className="panel">
            <h3>Status and owner</h3>
            <form action={updateEnquiry} className="ef-form">
              <input type="hidden" name="id" value={e.id} />
              <label className="ef">Status<select name="status" defaultValue={e.status}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
              <label className="ef">Assigned to
                <select name="assignee" defaultValue={e.assignee_id ?? ''}>
                  <option value="">Unassigned</option>
                  {owners.map((p) => <option key={p.id} value={p.id}>{p.full_name}{p.id === staff.id ? ' (me)' : ''}</option>)}
                </select>
              </label>
              <button type="submit" className="btn">Save</button>
            </form>
            <p className="admin-sub">Moving an enquiry out of &ldquo;new&rdquo; counts as the first reply and stops the one-hour clock.</p>
          </section>

          <section className="panel">
            <h3>Notes</h3>
            <form action={addNote} className="ef-form">
              <input type="hidden" name="id" value={e.id} />
              <label className="ef grow">Add a note<textarea name="body" rows={3} maxLength={2000} required /></label>
              <button type="submit" className="btn btn-outline">Save note</button>
            </form>
            {(notes ?? []).length === 0 && <p className="admin-sub">No notes yet.</p>}
            {(notes ?? []).map((n) => (
              <div className="note-item" key={n.id}>
                <p>{n.body}</p>
                <small>{(n.author as unknown as { full_name: string } | null)?.full_name ?? 'Unknown'} &middot; {formatIST(n.created_at)}</small>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
