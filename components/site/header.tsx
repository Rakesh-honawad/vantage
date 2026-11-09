import Link from 'next/link'
import { EnquireLink } from './enquire-link'
import { getText, type Locale, withLocale } from '@/lib/i18n'

const links = (locale: Locale) => [
  { label: getText(locale, 'home'), href: withLocale('/', locale) },
  { label: getText(locale, 'packages'), href: withLocale('/packages', locale) },
  { label: getText(locale, 'contact'), href: withLocale('/#contact', locale) },
]

export function Header({ locale = 'en' }: { locale?: Locale }) {
  return (
    <header className="header">
      <Link href={withLocale('/', locale)} className="brand">Rocky<span>TRAVEL</span></Link>
      <nav aria-label="Main">
        {links(locale).map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </nav>
      <div className="header-right">
        <EnquireLink />
        <div style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'center' }}>
          {(['en', 'hi', 'de'] as const).map((lang) => (
            <Link key={lang} href={withLocale(typeof window === 'undefined' ? '/' : window.location.pathname + window.location.search.replace(/lang=[^&]+/, ''), lang as Locale)} style={{ opacity: lang === locale ? 1 : 0.6, textTransform: 'uppercase' }}>
              {lang}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
