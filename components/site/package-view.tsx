import { EnquiryForm } from '@/components/site/enquiry-form'
import { PricePanel } from '@/components/site/price-panel'
import { RouteMap } from '@/components/site/route-map'
import { PRICE_BASIS, formatINR, hasPricingGap, seasonRange } from '@/lib/pricing'
import type { TourPackage } from '@/lib/types'
import { getText, type Locale } from '@/lib/i18n'

/** The package page body. Used by the public page and by the staff preview of a draft. */
export function PackageView({ p, preview = false, locale = 'en' }: { p: TourPackage; preview?: boolean; locale?: Locale }) {
  return (
    <main className="detail">
      <div className="detail-hero" style={{ backgroundImage: p.coverImage ? `url(${p.coverImage})` : undefined }}>
        <div>
          <span className="eyebrow">{p.code} &middot; {p.hotelStars} star stays</span>
          <h1>{p.title || 'Untitled package'}</h1>
          <p>{p.days} days &middot; {p.destinations.join(' \u00b7 ')}</p>
        </div>
      </div>

      <div className="detail-body">
        <div>
          <span className="eyebrow">{getText(locale, 'route')}</span>
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
                <div className="day-body"><p>{d.description}</p><small>Meals: {d.meals.join(', ') || 'None'}</small></div>
              </details>
            ))}
          </div>
        </div>
        {p.seasons.length > 0 && <PricePanel seasons={p.seasons} />}
      </div>

      <div className="detail-extras">
        <section><h3>{getText(locale, 'included')}</h3><ul className="plain-list">{p.inclusions.map((x) => <li key={x}>{x}</li>)}</ul></section>
        <section><h3>{getText(locale, 'notIncluded')}</h3><ul className="plain-list">{p.exclusions.map((x) => <li key={x}>{x}</li>)}</ul></section>
        <section>
          <h3>{getText(locale, 'whereStay')}</h3>
          <ul className="plain-list">{p.hotels.map((h) => <li key={h.name}>{h.name}<small>{h.city} &middot; {h.stars} star</small></li>)}</ul>
        </section>
        <section><h3>{getText(locale, 'route')}</h3><RouteMap stops={p.routeStops} /></section>
        <section className="span-2">
          <h3>{getText(locale, 'seasonalPrices')}</h3>
          <table className="price-table">
            <thead><tr><th>{getText(locale, 'season')}</th><th>{getText(locale, 'dates')}</th><th>{getText(locale, 'price')}</th></tr></thead>
            <tbody>
              {p.seasons.map((s) => (
                <tr key={s.name}><td>{s.name}</td><td>{seasonRange(s)}</td><td>{formatINR(s.pricePerPerson)} <small>{PRICE_BASIS}</small></td></tr>
              ))}
            </tbody>
          </table>
          {hasPricingGap(p) && <p className="note">{getText(locale, 'askQuote')}</p>}
        </section>
        <section className="span-2"><h3>{getText(locale, 'changes')}</h3><p className="note">{p.cancellationNote}</p></section>
      </div>

      {preview ? (
        <section className="enquiry"><div><span className="eyebrow">{getText(locale, 'makeItYours')}</span><h2>{getText(locale, 'tellUsAbout')}<br /><em>{getText(locale, 'yourTrip')}</em></h2><p className="enquiry-for">The enquiry form is switched off in preview mode.</p></div></section>
      ) : (
        <EnquiryForm packageCode={p.code} packageTitle={p.title} locale={locale} />
      )}
    </main>
  )
}
