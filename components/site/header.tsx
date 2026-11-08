import Link from 'next/link'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'Contact', href: '#contact' },
]

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="brand">KASAVU<span>TRAVEL</span></Link>
      <nav aria-label="Main">
        {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </nav>
      <div className="header-right">
        <details className="menu">
          <summary>Menu</summary>
          <div>{links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</div>
        </details>
      </div>
    </header>
  )
}
