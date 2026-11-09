'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Btn } from './btn'
import '@/app/inbox.css'
import { getText, type Locale } from '@/lib/i18n'

type State = 'idle' | 'sending' | 'sent' | 'error'

export function EnquiryForm({ packageCode, packageTitle, locale = 'en' }: { packageCode?: string; packageTitle?: string; locale?: Locale }) {
  const [state, setState] = useState<State>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ack, setAck] = useState('')
  const [trackPath, setTrackPath] = useState('')
  const pop = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (state === 'sent' && pop.current && !pop.current.open) pop.current.showModal()
  }, [state])

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
      setTrackPath(data.trackPath ?? '')
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <section id="enquire" className="enquiry">
      <div>
        <span className="eyebrow">{getText(locale, 'makeItYours')}</span>
        <h2>{getText(locale, 'tellUsAbout')}<br /><em>{getText(locale, 'yourTrip')}</em>.</h2>
        {packageTitle && <p className="enquiry-for">{getText(locale, 'about')}: {packageTitle}</p>}
      </div>
      {state === 'sent' ? (
        <div className="confirmation" role="status">
          <span className="eyebrow">{getText(locale, 'enquiryReceived')}</span>
          <h2>{getText(locale, 'thankYou') ?? 'Thank you'}<br /><em>{getText(locale, 'replyWithinHour')}</em></h2>
          <p>{ack}</p>
          {trackPath && <p className="ib-track-link">{getText(locale, 'yourConsultant')} <Link href={trackPath}>{getText(locale, 'yourEnquiryPage')}</Link>. {getText(locale, 'saveLink')}</p>}
        </div>
      ) : (
        <form className="enquiry-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <textarea name="message" aria-label={getText(locale, 'yourTrip')} placeholder={`${getText(locale, 'yourTrip')}: 2 adults, Kerala in December, houseboat`} aria-invalid={!!errors.message} />
            {errors.message && <small className="field-error" role="alert">{errors.message}</small>}
          </div>
          <div>
            <div className="field">
              <input name="name" aria-label={getText(locale, 'yourName')} placeholder={getText(locale, 'yourName')} autoComplete="name" aria-invalid={!!errors.name} />
              {errors.name && <small className="field-error" role="alert">{errors.name}</small>}
            </div>
            <div className="field">
              <input name="phone" aria-label={getText(locale, 'phoneNumber')} placeholder={getText(locale, 'phoneNumber')} type="tel" autoComplete="tel" aria-invalid={!!errors.phone} />
              {errors.phone && <small className="field-error" role="alert">{errors.phone}</small>}
            </div>
          </div>
          <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>
            <input type="checkbox" name="consent" /> {getText(locale, 'whatsappConsent')}
            <span>{getText(locale, 'privacyText')} <Link href="/privacy">{getText(locale, 'privacyLink')}</Link></span>
          </label>
          {state === 'error' && <p className="form-error" role="alert">We could not send your enquiry. Check your connection and try again.</p>}
          <Btn type="submit" disabled={state === 'sending'}>{state === 'sending' ? getText(locale, 'sending') : getText(locale, 'sendEnquiry')}</Btn>
        </form>
      )}
      <dialog ref={pop} className="eq-pop" aria-labelledby="eq-pop-title">
        <h3 id="eq-pop-title">{getText(locale, 'enquiryReceived')}</h3>
        <p>{ack}</p>
        {trackPath && <p>{getText(locale, 'yourConsultant')} <Link href={trackPath}>{getText(locale, 'yourEnquiryPage')}</Link>. {getText(locale, 'saveLink')}</p>}
        <form method="dialog"><Btn type="submit" autoFocus>{getText(locale, 'done')}</Btn></form>
      </dialog>
    </section>
  )
}
