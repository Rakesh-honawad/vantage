import Link from 'next/link'
import { EnquireLink } from './enquire-link'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'Contact', href: '#contact' },
]

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="brand">Rocky<span>TRAVEL</span></Link>
      <nav aria-label="Main">
        {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </nav>
      <div className="header-right">
        <EnquireLink />
        <details className="menu">
          <summary>Menu</summary>
          <div>{links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</div>
        </details>
      </div>
    </header>
  )
}