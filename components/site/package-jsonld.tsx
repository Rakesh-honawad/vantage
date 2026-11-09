import { lowestPrice } from '@/lib/pricing'
import type { TourPackage } from '@/lib/types'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/** Structured data so search engines can show the trip, its length and a from-price. */
export function PackageJsonLd({ p }: { p: TourPackage }) {
  const low = lowestPrice(p)
  const url = `${base}/packages/${p.slug}`
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: p.title,
    description: p.summary,
    url,
    ...(p.coverImage ? { image: [p.coverImage] } : {}),
    itinerary: { '@type': 'ItemList', itemListElement: p.itinerary.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.title })) },
    ...(Number.isFinite(low) && low > 0
      ? { offers: { '@type': 'Offer', url, priceCurrency: 'INR', price: low, description: 'Per person, twin sharing, plus GST. Price varies by season.' } }
      : {}),
  }
  // "<" is escaped so editor-written text can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
