import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EnquiryForm } from '@/components/site/enquiry-form'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { PricePanel } from '@/components/site/price-panel'
import { RouteMap } from '@/components/site/route-map'
import { getPackageBySlug, getPublishedPackages } from '@/lib/data/packages'
import { PRICE_BASIS, formatINR, hasPricingGap, seasonRange } from '@/lib/pricing'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPublishedPackages()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPackageBySlug((await params).slug)
  if (!p) return {}
  return { title: p.title, description: p.summary, openGraph: { title: p.title, description: p.summary, images: [p.coverImage] } }
}

export default async function PackagePage({ params }: Props) {
  const p = await getPackageBySlug((await params).slug)
  if (!p) notFound()

  return (
    <>
      <Header />
      <main className="detail">
        <div className="detail-hero" style={{ backgroundImage: `url(${p.coverImage})` }}>
          <div>
            <span className="eyebrow">{p.code} &middot; {p.hotelStars} star stays</span>
            <h1>{p.title}</h1>
            <p>{p.days} days &middot; {p.destinations.join(' \u00b7 ')}</p>
          </div>
        </div>

        <div className="detail-body">
          <div>
            <span className="eyebrow">The route</span>
            <h2>A little more time<br /><em>for the good things.</em></h2>
            <p className="lead">{p.summary}</p>
            <div className="itinerary">
              {p.itinerary.map((d) => (
                <details className="day" key={d.day} open={d.day === 1}>
                  <summary className="itinerary-row">
                    <span className="daynum">{String(d.day).padStart(2, '0')}</span>
                    <div><span className="mono">Day {d.day} &middot; {d.stay}</span><h3>{d.title}</h3></div>
                    <span className="plus" aria-hidden="true">+</span>
                  </summary>
                  <div className="day-body"><p>{d.description}</p><small>Meals: {d.meals.join(', ')}</small></div>
                </details>
              ))}
            </div>
          </div>
          <PricePanel seasons={p.seasons} />
        </div>

        <div className="detail-extras">
          <section><h3>Included</h3><ul className="plain-list">{p.inclusions.map((x) => <li key={x}>{x}</li>)}</ul></section>
          <section><h3>Not included</h3><ul className="plain-list">{p.exclusions.map((x) => <li key={x}>{x}</li>)}</ul></section>
          <section>
            <h3>Where you stay</h3>
            <ul className="plain-list">{p.hotels.map((h) => <li key={h.name}>{h.name}<small>{h.city} &middot; {h.stars} star</small></li>)}</ul>
          </section>
          <section><h3>The route</h3><RouteMap stops={p.routeStops} /></section>
          <section className="span-2">
            <h3>Seasonal prices</h3>
            <table className="price-table">
              <thead><tr><th>Season</th><th>Dates</th><th>Price</th></tr></thead>
              <tbody>
                {p.seasons.map((s) => (
                  <tr key={s.name}><td>{s.name}</td><td>{seasonRange(s)}</td><td>{formatINR(s.pricePerPerson)} <small>{PRICE_BASIS}</small></td></tr>
                ))}
              </tbody>
            </table>
            {hasPricingGap(p) && <p className="note">Travelling in another month? Ask us and we will quote it.</p>}
          </section>
          <section className="span-2"><h3>Changes and cancellation</h3><p className="note">{p.cancellationNote}</p></section>
        </div>

        <EnquiryForm packageCode={p.code} packageTitle={p.title} />
      </main>
      <Footer />
    </>
  )
}
