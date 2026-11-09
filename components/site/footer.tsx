import Link from 'next/link'
import { getText, type Locale, withLocale } from '@/lib/i18n'

export function Footer({ locale = 'en' }: { locale?: Locale }) {
  return (
    <footer>
      <div className="footer-brand">Rocky<span>TRAVEL</span><p>Thoughtful journeys through<br />the southern coast.</p></div>
      <div>
        <span className="mono">{getText(locale, 'footerExplore')}</span>
        <Link href={withLocale('/packages', locale)}>{getText(locale, 'packages')}</Link>
        <Link href={withLocale('/destinations/munnar', locale)}>Munnar</Link>
        <Link href={withLocale('/destinations/alleppey', locale)}>Alleppey</Link>
      </div>
      <div id="contact"><span className="mono">{getText(locale, 'sayHello')}</span><p>hello@Rockytravel.in<br />+91 484 401 2211</p></div>
      <div className="footer-note">&copy; {new Date().getFullYear()} Rocky Travel<br />{getText(locale, 'privacyText')} <Link href={withLocale('/privacy', locale)}>{getText(locale, 'privacy')}</Link></div>
    </footer>
  )
}
