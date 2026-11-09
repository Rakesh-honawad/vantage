import type { Metadata } from 'next'
import { Btn } from '@/components/site/btn'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { PackageCard } from '@/components/site/package-card'
import { PackageFilters } from '@/components/site/package-filters'
import { type Duration, getDestinations, getPublishedPackages } from '@/lib/data/packages'
import { getLocale } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Kerala and South India holiday packages',
  description: 'Browse day-wise Kerala and South India packages with seasonal prices per person.',
}

type Search = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const int = (v: string | undefined, min: number, max: number) => {
  const n = Number(v)
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined
}

export default async function PackagesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams
  const locale = getLocale(sp)
  const d = one(sp.duration)
  const [results, destinations] = await Promise.all([
    getPublishedPackages({
      q: one(sp.q),
      destination: one(sp.destination),
      season: one(sp.season),
      duration: d === 'short' || d === 'mid' || d === 'long' ? (d as Duration) : undefined,
      stars: int(one(sp.stars), 3, 5),
      month: int(one(sp.month), 1, 12),
    }),
    getDestinations(),
  ])

  return (
    <>
      <Header locale={locale} />
      <main className="listing">
        <div className="list-intro">
          <span className="eyebrow">Curated, not crowded</span>
          <h1>Find your<br /><em>kind of Kerala.</em></h1>
          <p>Every journey is made with room for the unexpected.</p>
        </div>
        <PackageFilters destinations={destinations} count={results.length} locale={locale} />
        <div className="pkg-grid list-grid">{results.map((p) => <PackageCard key={p.code} p={p} />)}</div>
        {results.length === 0 && (
          <div className="empty">
            <h3>Nothing matches.</h3>
            <p>Try fewer filters, or tell us what you have in mind and we will suggest a journey.</p>
            <Btn href="/packages">Reset filters</Btn>
          </div>
        )}
      </main>
      <Footer locale={locale} />
    </>
  )
}
