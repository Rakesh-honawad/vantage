import Link from 'next/link'
import { lowestPrice } from '@/lib/pricing'
import type { TourPackage } from '@/lib/types'
import { Price } from './price'

export function PackageCard({ p }: { p: TourPackage }) {
  return (
    <Link href={`/packages/${p.slug}`} className="pkg-card">
      <div className="pkg-image" style={{ backgroundImage: `url(${p.coverImage})` }}>
        <span className="tag">{p.tag}</span>
        <span className="card-arrow" aria-hidden="true">&#8599;</span>
      </div>
      <div className="pkg-info">
        <span className="mono">{p.days} days &middot; {p.hotelStars} star</span>
        <h3>{p.title}</h3>
        <p>{p.destinations.join(' \u00b7 ')}</p>
        <Price amount={lowestPrice(p)} from />
      </div>
    </Link>
  )
}
