import 'server-only'

export type Delivery = { channel: 'link' | 'whatsapp'; status: string }

/**
 * Delivers a staff reply to a traveller.
 * Real delivery today: the reply appears on the traveller's private enquiry page (the link they get
 * when they submit the form). WhatsApp is a MOCK: it only records that a message would be queued,
 * and only when the traveller gave consent. To go live, call your WhatsApp provider where marked.
 */
export async function deliverReply(e: { whatsappConsent: boolean; phone: string }, _body: string): Promise<Delivery> {
  if (e.whatsappConsent) {
    // TODO(go-live): send through the WhatsApp Business API here, using an approved template.
    console.info('[mock] WhatsApp reply queued for a consenting traveller')
    return { channel: 'whatsapp', status: 'link + whatsapp (mock)' }
  }
  return { channel: 'link', status: 'link' }
}
