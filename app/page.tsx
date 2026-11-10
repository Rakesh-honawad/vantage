import Link from 'next/link'
import type { Metadata } from 'next'
import { Btn } from '@/components/site/btn'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { PackageCard } from '@/components/site/package-card'
import { getDestinations, getPublishedPackages } from '@/lib/data/packages'
import { photo } from '@/lib/mock-data'
import { slugify } from '@/lib/package-rules'
import { MONTH_NAMES, seasonRange } from '@/lib/pricing'
import { getLocale, getText, type Locale, withLocale } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Rocky Travel | Kerala holiday packages',
  description: 'Unhurried Kerala and South India holiday packages for families, couples and groups.',
}

export const revalidate = 60

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const locale = getLocale(resolvedSearchParams)
  const [all, destinations] = await Promise.all([getPublishedPackages(), getDestinations()])
  const tile = (name: string, img: string) => {
    const matching = all.filter((p) => p.seasons.some((s) => s.name === name))
    const s = matching[0]?.seasons.find((x) => x.name === name)
    return { name, img, range: s ? seasonRange(s) : '', count: matching.length }
  }
  const seasons = [tile('Peak', photo.peak), tile('Monsoon', photo.hills)]

  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="hero">
          <div className="hero-photo" />
          <div className="hero-copy">
            <span className="eyebrow">A slower way to travel &middot; Kerala, India</span>
            <h1>Kerala,<br /><em>in its own time.</em></h1>
            <p>Handwoven journeys through backwaters, forests, tea hills and the many moods of the Malabar coast.</p>
            <form className="searchbar" action={withLocale('/packages', locale)}>
              <div>
                <label htmlFor="hd">{getText(locale, 'destination')}</label>
                <select id="hd" name="destination" defaultValue="">
                  <option value="">{getText(locale, 'anywhereKerala')}</option>
                  {destinations.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="hm">{getText(locale, 'when')}</label>
                <select id="hm" name="month" defaultValue="">
                  <option value="">{getText(locale, 'anyMonth')}</option>
                  {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <Btn type="submit">{getText(locale, 'findJourney')}</Btn>
            </form>
          </div>
        </section>

        <section className="season section">
          <div className="section-head">
            <div><span className="eyebrow">Find your rhythm</span><h2>Choose your season</h2></div>
            <p>Two ways to see the same land.<br />Both worth taking slowly.</p>
          </div>
          <div className="season-grid">
            {seasons.map((s) => (
              <Link key={s.name} href={withLocale(`/packages?season=${s.name}`, locale)} className="season-tile" style={{ backgroundImage: `url(${s.img})` }}>
                <span className="mono">{s.count} {s.count === 1 ? getText(locale, 'journey') : getText(locale, 'journeys')}</span>
                <div><h3>{s.name}</h3><p>{s.range}</p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section packages-section">
          <div className="section-head">
            <div><span className="eyebrow">Made for you</span><h2>{getText(locale, 'featured')}</h2></div>
            <Btn outline href={withLocale('/packages', locale)}>{getText(locale, 'seeAll')}</Btn>
          </div>
          <div className="pkg-grid">{all.slice(0, 3).map((p) => <PackageCard key={p.code} p={p} />)}</div>
        </section>

        <section className="destination-strip">
          <div className="section-head"><div><span className="eyebrow">Places to pause</span><h2>Where will you go?</h2></div></div>
          <div className="destinations">
            {destinations.map((d, i) => (
              <Link key={d} href={withLocale(`/destinations/${slugify(d)}`, locale)}>
                <span>{String(i + 1).padStart(2, '0')}</span><strong>{d}</strong><i aria-hidden="true">&#8599;</i>
              </Link>
            ))}
          </div>
        </section>

        <section className="section how">
          <span className="eyebrow">A simple beginning</span>
          <h2>Travel should feel<br /><em>like a conversation.</em></h2>
          <div className="steps">
            {[['01', 'Tell us', 'Share where you want to go, when, and what matters.'], ['02', 'We listen', 'A thoughtful plan lands in your inbox within the hour.'], ['03', 'You travel', 'Everything flows once the details are clear.']].map((x) => (
              <div key={x[0]}><span className="daynum">{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></div>
            ))}
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  )
}
