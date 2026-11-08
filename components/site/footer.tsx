import Link from 'next/link'

export function Footer() {
  return (
    <footer>
      <div className="footer-brand">KASAVU<span>TRAVEL</span><p>Thoughtful journeys through<br />the southern coast.</p></div>
      <div>
        <span className="mono">Explore</span>
        <Link href="/packages">Packages</Link>
        <Link href="/packages?destination=Munnar">Munnar</Link>
        <Link href="/packages?destination=Alleppey">Alleppey</Link>
      </div>
      <div id="contact"><span className="mono">Say hello</span><p>hello@kasavutravel.in<br />+91 484 401 2211</p></div>
      <div className="footer-note">&copy; {new Date().getFullYear()} Kasavu Travel<br />Your data stays yours. <Link href="/privacy">Privacy</Link></div>
    </footer>
  )
}
