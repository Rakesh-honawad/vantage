'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Btn } from './btn'

type State = 'idle' | 'sending' | 'sent' | 'error'

export function EnquiryForm({ packageCode, packageTitle }: { packageCode?: string; packageTitle?: string }) {
  const [state, setState] = useState<State>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ack, setAck] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body = {
      message: String(f.get('message') ?? ''),
      name: String(f.get('name') ?? ''),
      phone: String(f.get('phone') ?? ''),
      whatsappConsent: f.get('consent') === 'on',
      website: String(f.get('website') ?? ''),
      packageCode,
    }
    setState('sending')
    setErrors({})
    try {
      const res = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (res.status === 400) {
        setErrors(data.errors ?? {})
        setState('idle')
        return
      }
      if (!res.ok) throw new Error('failed')
      setAck(data.acknowledgement)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <section id="enquire" className="enquiry">
      <div>
        <span className="eyebrow">Make it yours</span>
        <h2>Tell us about<br /><em>your trip.</em></h2>
        {packageTitle && <p className="enquiry-for">About: {packageTitle}</p>}
      </div>
      {state === 'sent' ? (
        <div className="confirmation" role="status">
          <span className="eyebrow">Enquiry received</span>
          <h2>Thank you.<br /><em>We will reply within the hour.</em></h2>
          <p>{ack}</p>
        </div>
      ) : (
        <form className="enquiry-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <textarea name="message" aria-label="Your trip" placeholder="Tell us about your trip, for example: 2 adults, Kerala in December, houseboat" aria-invalid={!!errors.message} />
            {errors.message && <small className="field-error" role="alert">{errors.message}</small>}
          </div>
          <div>
            <div className="field">
              <input name="name" aria-label="Your name" placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name} />
              {errors.name && <small className="field-error" role="alert">{errors.name}</small>}
            </div>
            <div className="field">
              <input name="phone" aria-label="Phone number" placeholder="Phone number" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} />
              {errors.phone && <small className="field-error" role="alert">{errors.phone}</small>}
            </div>
          </div>
          <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>
            <input type="checkbox" name="consent" /> I am happy to receive a WhatsApp reply.
            <span>We only use your details to plan this trip. <Link href="/privacy">How we use your data</Link></span>
          </label>
          {state === 'error' && <p className="form-error" role="alert">We could not send your enquiry. Check your connection and try again.</p>}
          <Btn type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send enquiry'}</Btn>
        </form>
      )}
    </section>
  )
}
