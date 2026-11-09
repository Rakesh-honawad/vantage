import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { timeAgo } from '@/lib/format'
import { isToken } from '@/lib/inbox'
import { supabaseAdmin } from '@/lib/supabase/admin'
import '../../inbox.css'

export const metadata: Metadata = { title: 'Your enquiry', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const STEP: Record<string, string> = {
  new: 'Received. A consultant will reply within the hour, between 9am and 7pm IST.',
  contacted: 'A consultant has replied. Their message is below.',
  quoted: 'Your quote has been prepared. Your consultant will share it with you.',
  won: 'Your trip is confirmed.',
  lost: 'This enquiry is closed. You are welcome to write to us again.',
}

/** What a traveller sees at the private link they get when they send an enquiry. No sign-in, no staff data. */
export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!isToken(token)) notFound()
  const sb = supabaseAdmin()
  const { data: e } = await sb.from('enquiries').select('id, name, message, status, created_at').eq('public_token', token).maybeSingle()
  if (!e) notFound()
  const { data: replies } = await sb.from('enquiry_replies').select('id, body, created_at, author_id').eq('enquiry_id', e.id).eq('direction', 'outbound').order('created_at', { ascending: true })
  const ids = [...new Set((replies ?? []).map((r) => r.author_id).filter(Boolean))]
  const { data: people } = ids.length ? await sb.from('profiles').select('id, full_name').in('id', ids) : { data: [] as { id: string; full_name: string }[] }
  const first = new Map((people ?? []).map((p) => [p.id, String(p.full_name).split(' ')[0]]))

  return (
    <>
      <Header />
      <main className="ib-track">
        <span className="eyebrow">Your enquiry</span>
        <h1>Hello, {String(e.name).split(' ')[0]}.</h1>
        <p className="ib-track-status">{STEP[e.status as string] ?? STEP.new}</p>
        <section>
          <h3>What you sent, {timeAgo(e.created_at)}</h3>
          <p className="ib-quote">{e.message}</p>
        </section>
        <section>
          <h3>Replies</h3>
          {(replies ?? []).length === 0 ? <p className="ib-hint">No reply yet. Keep this page, it updates when your consultant writes back.</p> : (
            <ul className="ib-thread">
              {(replies ?? []).map((r) => (
                <li key={r.id}>
                  <small>{first.get(r.author_id) ?? 'Your consultant'}, Rocky Travel, {timeAgo(r.created_at)}</small>
                  <p>{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="ib-hint">Prices are per person, twin sharing, plus GST, and are confirmed in your quote.</p>
      </main>
      <Footer />
    </>
  )
}
