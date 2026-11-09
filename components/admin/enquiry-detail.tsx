'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { addNote, assignEnquiry, runAiAssist, saveCorrections, sendReply, setStatus, type ActionResult } from '@/app/admin/enquiries/actions'
import { Btn } from '@/components/site/btn'
import type { Extraction } from '@/lib/ai/schema'
import { formatINR, MONTH_NAMES } from '@/lib/pricing'
import { CHANNEL_LABEL, STATUSES, STATUS_LABEL, slaFor, type EnquiryView, type Note, type Reply, type StaffOption } from '@/lib/inbox'
import { timeAgo } from '@/lib/format'

type Me = { id: string; role: string; name: string }
const num = (s: string) => (s.trim() === '' ? null : Math.round(Number(s)))

function Corrections({ ex, onSave, busy }: { ex: Extraction; onSave: (e: unknown) => void; busy: boolean }) {
  const [f, setF] = useState({
    adults: ex.adults?.toString() ?? '', children: ex.children?.toString() ?? '', month: ex.month?.toString() ?? '',
    nights: ex.nights?.toString() ?? '', nightsMax: ex.nightsMax?.toString() ?? '', budget: ex.budgetTotal?.toString() ?? '',
    destinations: ex.destinations.join(', '), interests: ex.interests.join(', '),
  })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })
  const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
  return (
    <div className="ib-fields">
      <label className="fld">Adults<input inputMode="numeric" value={f.adults} onChange={set('adults')} /></label>
      <label className="fld">Children<input inputMode="numeric" value={f.children} onChange={set('children')} /></label>
      <label className="fld">Month
        <select value={f.month} onChange={set('month')}>
          <option value="">Not given</option>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </label>
      <label className="fld">Budget, whole group (₹)<input inputMode="numeric" value={f.budget} onChange={set('budget')} /></label>
      <label className="fld">Nights, from<input inputMode="numeric" value={f.nights} onChange={set('nights')} /></label>
      <label className="fld">Nights, to<input inputMode="numeric" value={f.nightsMax} onChange={set('nightsMax')} /></label>
      <label className="fld wide">Destinations<input value={f.destinations} onChange={set('destinations')} /><small>Separate with commas.</small></label>
      <label className="fld wide">Interests<input value={f.interests} onChange={set('interests')} /><small>For example: houseboat, honeymoon.</small></label>
      <div className="wide">
        <Btn outline disabled={busy} onClick={() => onSave({ adults: num(f.adults), children: num(f.children), month: num(f.month), nights: num(f.nights), nightsMax: num(f.nightsMax), budgetTotal: num(f.budget), destinations: list(f.destinations), interests: list(f.interests) })}>Save fields and update draft</Btn>
      </div>
    </div>
  )
}

export function EnquiryDetail({ view, replies, notes, staffOptions, me }: { view: EnquiryView; replies: Reply[]; notes: Note[]; staffOptions: StaffOption[]; me: Me }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [reply, setReply] = useState('')
  const [note, setNote] = useState('')

  const isAdmin = me.role === 'admin'
  const mine = view.assigneeId === me.id
  const canManage = isAdmin || mine
  const canReply = mine
  const sla = slaFor(view.createdAt, view.firstResponseAt, view.status)

  const run = (fn: () => Promise<ActionResult>, after?: () => void) =>
    start(async () => {
      const r = await fn()
      setMsg({ ok: r.ok, text: r.ok ? r.message ?? 'Done.' : r.error })
      if (r.ok) { after?.(); router.refresh() }
    })

  return (
    <div className="ib-detail">
      <header className="ib-head">
        <div>
          <span className="eyebrow">{view.ref}, {CHANNEL_LABEL[view.channel] ?? view.channel}</span>
          <h1>{view.name}</h1>
          <p className="ib-meta">{view.phone}{view.whatsappConsent ? ', OK to reply on WhatsApp' : ', no WhatsApp consent'}{view.packageCode ? `, about ${view.packageCode}` : ''}</p>
        </div>
        <div className="ib-head-r">
          <span className="ib-pill" data-s={view.status}>{STATUS_LABEL[view.status] ?? view.status}</span>
          <span className={`ib-sla${sla.overdue ? ' late' : ''}${sla.done ? ' done' : ''}`}>{sla.label}</span>
        </div>
      </header>
      {msg && <p className={`ib-msg ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.text}</p>}

      <div className="ib-cols">
        <div className="ib-main">
          <section className="ib-card">
            <h3>Their message</h3>
            <p className="ib-quote">{view.message}</p>
            <small>Received {timeAgo(view.createdAt)}</small>
          </section>

          <section className="ib-card">
            <div className="ib-card-head">
              <h3>AI assist</h3>
              <Btn outline disabled={pending || (!isAdmin && !mine && !!view.assigneeId)} onClick={() => run(() => runAiAssist(view.id))}>{view.extracted ? 'Run again' : 'Analyse this enquiry'}</Btn>
            </div>
            {!view.extracted ? (
              <p className="ib-hint">Reads the message, fills in the trip details, picks the three best packages and drafts a reply. Nothing is sent until you send it.</p>
            ) : (
              <>
                <p className="ib-hint">
                  {view.aiSource === 'ai' ? 'Read by AI.' : view.aiSource === 'corrected' ? 'Corrected by a person.' : 'Read by built-in rules.'} Check the fields against the message above. Prices come from the package price table only.
                </p>
                {canManage ? (
                  <Corrections key={view.aiAt ?? 'x'} ex={view.extracted} busy={pending} onSave={(x) => run(() => saveCorrections(view.id, x))} />
                ) : (
                  <p className="ib-hint">Take this enquiry to correct the fields.</p>
                )}
                <h4>Best-fit packages</h4>
                {view.suggestions?.length ? (
                  <ol className="ib-sugg">
                    {view.suggestions.map((s) => (
                      <li key={s.code}>
                        <strong>{s.title}</strong>
                        <span>{s.days} days, {s.hotelStars} star{s.pricePerPerson && s.seasonName ? `, ${s.seasonName}: ${formatINR(s.pricePerPerson)} per person, twin sharing, plus GST` : ''}</span>
                        {s.estimate != null && <span>About {formatINR(s.estimate)} plus GST for {view.extracted?.adults} adults{s.withinBudget === true ? ', within budget' : s.withinBudget === false ? ', above budget' : ''}</span>}
                        <small>{s.reasons.join('; ')}</small>
                      </li>
                    ))}
                  </ol>
                ) : <p className="ib-hint">No close match. Adjust the fields above or reply by hand.</p>}
              </>
            )}
          </section>

          <section className="ib-card">
            <h3>Replies</h3>
            {replies.length === 0 ? <p className="ib-hint">No reply sent yet.</p> : (
              <ul className="ib-thread">
                {replies.map((r) => (
                  <li key={r.id}>
                    <small>{r.author}, {timeAgo(r.createdAt)}, delivered by {r.delivery}</small>
                    <p>{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
            {canReply ? (
              <div className="ib-compose">
                {view.aiDraft && <button type="button" className="link-btn" onClick={() => setReply(view.aiDraft ?? '')}>Use the AI draft</button>}
                <textarea aria-label="Your reply" rows={10} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply, or use the draft and edit it." />
                <p className="ib-hint">The traveller reads this on their private enquiry page{view.whatsappConsent ? ' and it is queued on WhatsApp (mock), as they agreed' : ''}. You are accepting this text by sending it.</p>
                <Btn disabled={pending || reply.trim().length < 5} onClick={() => run(() => sendReply(view.id, reply), () => setReply(''))}>Send reply</Btn>
              </div>
            ) : (
              <p className="ib-hint">{view.assigneeId ? `Only ${view.assigneeName ?? 'the assigned consultant'} can reply to this enquiry.` : 'Take this enquiry to reply.'}</p>
            )}
          </section>
        </div>

        <aside className="ib-side">
          <section className="ib-card">
            <h3>Owner</h3>
            <p className="ib-owner">{view.assigneeName ?? 'Unassigned'}</p>
            {isAdmin ? (
              <label className="fld">Assign to
                <select value={view.assigneeId ?? ''} disabled={pending} onChange={(e) => run(() => assignEnquiry(view.id, e.target.value || null))}>
                  <option value="">Unassigned</option>
                  {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.name}{s.role === 'admin' ? ' (admin)' : ''}</option>)}
                </select>
              </label>
            ) : !view.assigneeId ? (
              <Btn disabled={pending} onClick={() => run(() => assignEnquiry(view.id, me.id))}>Take this enquiry</Btn>
            ) : null}
          </section>

          <section className="ib-card">
            <h3>Status</h3>
            <label className="fld">
              <select value={view.status} disabled={pending || !canManage} onChange={(e) => run(() => setStatus(view.id, e.target.value))} aria-label="Status">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </label>
          </section>

          <section className="ib-card">
            <h3>Notes</h3>
            {notes.length === 0 ? <p className="ib-hint">No notes yet.</p> : (
              <ul className="ib-notes">{notes.map((n) => <li key={n.id}><p>{n.body}</p><small>{n.author}{n.createdAt ? `, ${timeAgo(n.createdAt)}` : ''}</small></li>)}</ul>
            )}
            {canManage && (
              <div className="ib-compose">
                <textarea aria-label="Add a note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: called, no answer, try at 4pm." />
                <Btn outline disabled={pending || !note.trim()} onClick={() => run(() => addNote(view.id, note), () => setNote(''))}>Add note</Btn>
              </div>
            )}
          </section>

          {view.trackPath && <p className="ib-hint">Traveller page: <a href={view.trackPath} target="_blank" rel="noreferrer" className="link-btn">open</a></p>}
        </aside>
      </div>
    </div>
  )
}
