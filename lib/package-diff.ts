import { formatINR } from './pricing'
import type { PackageContent } from './types'

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Plain-language list of what changed between two versions, for the history drawer. */
export function diffPackages(a: PackageContent | null, b: PackageContent): string[] {
  if (!a) return ['First version']
  const out: string[] = []
  if (a.title !== b.title) out.push(`Name: "${a.title}" to "${b.title}"`)
  if (a.summary !== b.summary) out.push('Summary changed')
  for (const s of b.seasons) {
    const o = a.seasons.find((x) => x.name === s.name)
    if (!o) out.push(`Added season ${s.name}`)
    else {
      if (o.pricePerPerson !== s.pricePerPerson) out.push(`${s.name} price: ${formatINR(o.pricePerPerson)} to ${formatINR(s.pricePerPerson)}`)
      if (o.fromMonth !== s.fromMonth || o.toMonth !== s.toMonth) out.push(`${s.name} dates changed`)
    }
  }
  for (const o of a.seasons) if (!b.seasons.some((x) => x.name === o.name)) out.push(`Removed season ${o.name}`)
  if (a.itinerary.length !== b.itinerary.length) out.push(`Days: ${a.itinerary.length} to ${b.itinerary.length}`)
  else if (!same(a.itinerary, b.itinerary)) out.push('Itinerary text changed')
  if (a.hotelStars !== b.hotelStars) out.push(`Hotel stars: ${a.hotelStars} to ${b.hotelStars}`)
  if (!same(a.hotels, b.hotels)) out.push('Hotels changed')
  if (!same(a.inclusions, b.inclusions) || !same(a.exclusions, b.exclusions)) out.push('Inclusions or exclusions changed')
  if (a.coverImage !== b.coverImage || !same(a.gallery, b.gallery)) out.push('Photos changed')
  if (a.cancellationNote !== b.cancellationNote) out.push('Cancellation note changed')
  return out.length ? out : ['No visible changes']
}
