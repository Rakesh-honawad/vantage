import { MONTH_NAMES, formatINR, getSeasonForMonth, seasonRange } from '@/lib/pricing'
import type { TourPackage } from '@/lib/types'
import type { Extraction } from './schema'

export type Suggestion = {
  code: string; slug: string; title: string; days: number; nights: number; hotelStars: number
  score: number; reasons: string[]
  seasonName: string | null; seasonRange: string | null
  pricePerPerson: number | null; estimate: number | null; withinBudget: boolean | null
}

const haystack = (p: TourPackage) =>
  [p.title, p.summary, p.tag, p.destinations.join(' '), p.itinerary.map((d) => `${d.title} ${d.description} ${d.stay}`).join(' '), p.inclusions.join(' '), p.hotels.map((h) => h.name).join(' ')].join(' ').toLowerCase()

/**
 * Ranks published packages against what the traveller asked for. Plain scoring, no AI, so the same
 * enquiry always gives the same result. Every price comes from the package's own season table.
 */
export function suggestPackages(ex: Extraction, pkgs: TourPackage[], limit = 3): Suggestion[] {
  const out = pkgs.map((p): Suggestion & { relevant: boolean } => {
    let score = 0
    let relevant = false // price and budget alone never make a package a suggestion
    const reasons: string[] = []
    const text = haystack(p)

    const matched = ex.destinations.filter((d) => p.destinations.some((x) => x.toLowerCase() === d.toLowerCase()))
    if (matched.length) { relevant = true; score += 3 * matched.length; reasons.push(`Visits ${matched.join(', ')}`) }
    for (const i of ex.interests) if (text.includes(i.toLowerCase())) { relevant = true; score += 2; reasons.push(`Includes ${i}`) }

    if (ex.nights) {
      const hi = ex.nightsMax ?? ex.nights
      if (p.nights >= ex.nights && p.nights <= hi) { relevant = true; score += 3; reasons.push(`${p.nights} nights, as you asked`) }
      else if (p.nights >= ex.nights - 1 && p.nights <= hi + 1) { relevant = true; score += 1; reasons.push(`${p.nights} nights, close to what you asked`) }
    }

    let season = ex.month ? getSeasonForMonth(p, ex.month) : [...p.seasons].sort((a, b) => a.pricePerPerson - b.pricePerPerson)[0]
    if (ex.month && !season) { score -= 5; reasons.push(`No price is set for ${MONTH_NAMES[ex.month - 1]}`) }
    else if (ex.month && season) score += 2
    season = season && season.pricePerPerson > 0 ? season : undefined

    const price = season?.pricePerPerson ?? null
    const estimate = price && ex.adults ? price * ex.adults : null
    let withinBudget: boolean | null = null
    if (estimate && ex.budgetTotal) {
      withinBudget = estimate <= ex.budgetTotal
      score += withinBudget ? 2 : -1
      const kids = (ex.children ?? 0) > 0
      reasons.push(withinBudget ? (kids ? 'Adults-only estimate is within your budget; child cost is extra' : 'Fits your budget') : 'Above your budget')
    }
    return {
      code: p.code, slug: p.slug, title: p.title, days: p.days, nights: p.nights, hotelStars: p.hotelStars,
      score, reasons, seasonName: season?.name ?? null, seasonRange: season ? seasonRange(season) : null,
      pricePerPerson: price, estimate, withinBudget, relevant,
    }
  })
  return out
    .filter((s) => s.relevant && s.score > 0)
    .sort((a, b) => b.score - a.score || (a.pricePerPerson ?? Infinity) - (b.pricePerPerson ?? Infinity))
    .slice(0, limit)
    .map(({ relevant: _r, ...s }) => s)
}

/** The reply a consultant starts from. Prices are filled in here from the price table, never written by AI. */
export function buildDraft(o: { name: string; ex: Extraction; suggestions: Suggestion[]; intro?: string | null; consultant: string }): string {
  const first = o.name.trim().split(/\s+/)[0] || 'there'
  const where = o.ex.destinations.length ? o.ex.destinations.join(', ') : 'Kerala'
  const when = o.ex.month ? ` in ${MONTH_NAMES[o.ex.month - 1]}` : ''
  const intro = o.intro || `Thank you for writing to us about your trip to ${where}${when}. We would be glad to plan it with you.`
  const lines: string[] = [`Hi ${first},`, '', intro, '']

  if (o.suggestions.length) {
    lines.push('Based on what you shared, these journeys suit you best:', '')
    o.suggestions.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.title} (${s.days} days, ${s.nights} nights, ${s.hotelStars} star stays)`)
      if (s.pricePerPerson && s.seasonName) {
        lines.push(`   ${s.seasonName} season (${s.seasonRange}): ${formatINR(s.pricePerPerson)} per person, twin sharing, plus GST.`)
        if (s.estimate && o.ex.adults) lines.push(`   For ${o.ex.adults} adults that is about ${formatINR(s.estimate)} plus GST. Child pricing is confirmed in your quote.`)
      }
      if (s.reasons.length) lines.push(`   Why: ${s.reasons.join('; ')}.`)
      lines.push('')
    })
    lines.push('Prices are indicative and are confirmed in your quote.', '')
  } else {
    lines.push('We would like to suggest a journey that fits you well, and need a few details first.', '')
  }

  const asks: string[] = []
  if (!o.ex.month) asks.push('your travel dates')
  if (!o.ex.adults) asks.push('how many adults are travelling')
  if (o.ex.children == null) asks.push('whether any children are travelling, and their ages')
  if (asks.length) lines.push(`Could you tell us ${asks.join(', ')}?`, '')
  else lines.push('If one of these looks right, tell us and we will prepare your quote.', '')

  lines.push('Warm regards,', o.consultant, 'Rocky Travel')
  return lines.join('\n')
}
