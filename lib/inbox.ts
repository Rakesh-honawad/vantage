import type { Extraction } from './ai/schema'
import type { Suggestion } from './ai/suggest'

export const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const
export type EnquiryStatus = (typeof STATUSES)[number]
export const STATUS_LABEL: Record<string, string> = { new: 'New', contacted: 'Contacted', quoted: 'Quoted', won: 'Won', lost: 'Lost' }
export const OPEN_STATUSES = ['new', 'contacted', 'quoted']
export const CHANNEL_LABEL: Record<string, string> = { web: 'Web form', whatsapp: 'WhatsApp', email: 'Email', phone: 'Phone', chat: 'Chat' }
export const SLA_MINUTES = 60

export const enquiryRef = (id: string) => `ENQ-${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`
export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
export const isToken = (s: string) => /^[0-9a-f]{32}$/.test(s)

const span = (m: number) => (m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${Math.floor(m / 1440)} days`)

/** The one-hour reply target, shown on every enquiry. */
export function slaFor(createdAt: string, firstResponseAt: string | null, status: string, now: number = Date.now()) {
  const start = new Date(createdAt).getTime()
  if (firstResponseAt) {
    const m = Math.max(0, Math.round((new Date(firstResponseAt).getTime() - start) / 60000))
    return { label: `Replied in ${span(m)}`, overdue: m > SLA_MINUTES, done: true }
  }
  if (status === 'won' || status === 'lost') return { label: 'Closed', overdue: false, done: true }
  const m = Math.max(0, Math.round((now - start) / 60000))
  return { label: m > SLA_MINUTES ? `Waiting ${span(m)}, overdue` : `Waiting ${span(m)}`, overdue: m > SLA_MINUTES, done: false }
}

export type Reply = { id: string; body: string; createdAt: string; author: string; delivery: string }
export type Note = { id: string; body: string; createdAt: string | null; author: string }
export type EnquiryView = {
  id: string; ref: string; name: string; phone: string; channel: string; message: string; status: string
  assigneeId: string | null; assigneeName: string | null; createdAt: string; firstResponseAt: string | null
  whatsappConsent: boolean; packageCode: string | null; trackPath: string | null
  extracted: Extraction | null; suggestions: Suggestion[] | null; aiDraft: string | null; aiSource: string | null; aiAt: string | null
}
export type StaffOption = { id: string; name: string; role: string }
