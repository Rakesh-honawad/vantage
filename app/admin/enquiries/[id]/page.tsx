import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EnquiryDetail } from '@/components/admin/enquiry-detail'
import type { Extraction } from '@/lib/ai/schema'
import type { Suggestion } from '@/lib/ai/suggest'
import { requireStaff } from '@/lib/auth'
import { enquiryRef, isUuid, type EnquiryView, type Note, type Reply, type StaffOption } from '@/lib/inbox'
import { supabaseAdmin } from '@/lib/supabase/admin'
import '../../../inbox.css'

export const metadata: Metadata = { title: 'Enquiry' }
export const dynamic = 'force-dynamic'

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff(['admin', 'consultant'])
  const { id } = await params
  if (!isUuid(id)) notFound()
  const sb = supabaseAdmin()
  const { data: e } = await sb.from('enquiries').select('*').eq('id', id).maybeSingle()
  if (!e) notFound()
  // A consultant cannot open an enquiry that belongs to a colleague.
  if (staff.role === 'consultant' && e.assignee_id && e.assignee_id !== staff.id) notFound()

  const [{ data: people }, { data: notes }, { data: replies }] = await Promise.all([
    sb.from('profiles').select('id, full_name, role'),
    sb.from('enquiry_notes').select('*').eq('enquiry_id', id),
    sb.from('enquiry_replies').select('*').eq('enquiry_id', id).order('created_at', { ascending: true }),
  ])
  const name = new Map((people ?? []).map((p) => [p.id as string, p.full_name as string]))

  const view: EnquiryView = {
    id, ref: enquiryRef(id), name: e.name, phone: e.phone ?? '', channel: e.channel ?? 'web', message: e.message ?? '', status: e.status ?? 'new',
    assigneeId: e.assignee_id ?? null, assigneeName: e.assignee_id ? name.get(e.assignee_id) ?? null : null,
    createdAt: e.created_at, firstResponseAt: e.first_response_at ?? null, whatsappConsent: !!e.whatsapp_consent, packageCode: e.package_code ?? null,
    trackPath: e.public_token ? `/enquiry/${e.public_token}` : null,
    extracted: (e.extracted as Extraction | null) ?? null, suggestions: (e.ai_suggestions as Suggestion[] | null) ?? null,
    aiDraft: e.ai_draft ?? null, aiSource: e.ai_source ?? null, aiAt: e.ai_at ?? null,
  }
  const replyList: Reply[] = (replies ?? []).map((r) => ({ id: r.id, body: r.body, createdAt: r.created_at, author: name.get(r.author_id) ?? 'Consultant', delivery: r.delivery ?? 'link' }))
  const noteList: Note[] = (notes ?? [])
    .map((n) => ({ id: String(n.id ?? n.created_at ?? Math.random()), body: n.body as string, createdAt: (n.created_at as string | undefined) ?? null, author: name.get(n.author_id) ?? 'Staff' }))
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
  const staffOptions: StaffOption[] = (people ?? []).filter((p) => p.role === 'consultant' || p.role === 'admin').map((p) => ({ id: p.id, name: p.full_name, role: p.role }))

  return (
    <>
      <p className="ib-back"><Link href="/admin/enquiries">Back to enquiries</Link></p>
      <EnquiryDetail view={view} replies={replyList} notes={noteList} staffOptions={staffOptions} me={{ id: staff.id, role: staff.role, name: staff.name }} />
    </>
  )
}
