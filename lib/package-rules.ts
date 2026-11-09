import { findSeasonOverlaps } from './pricing'
import { PLACES } from './places'
import type { PackageContent } from './types'

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)

/** Fills in what the editor should never have to type: day numbers, nights, cover order, map stops. */
export function normalize(c: PackageContent, by: string): PackageContent {
  const itinerary = c.itinerary.map((d, i) => ({ ...d, day: i + 1 }))
  const cover = c.coverImage || c.gallery[0] || ''
  const gallery = [...new Set([cover, ...c.gallery].filter(Boolean))]
  const routeStops = c.destinations.flatMap((n) => {
    const p = PLACES[n.toLowerCase()]
    return p ? [{ name: n, lat: p[0], lng: p[1] }] : []
  })
  return {
    ...c,
    slug: c.slug || slugify(c.title) || c.code.toLowerCase(),
    days: itinerary.length,
    nights: Math.max(0, itinerary.length - 1),
    itinerary, coverImage: cover, gallery, routeStops,
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  }
}

/** Everything that must be fixed before a package can go live. Drafts may be incomplete. */
export function publishIssues(c: PackageContent): string[] {
  const out: string[] = []
  if (!c.title.trim()) out.push('Add a package name.')
  if (!c.summary.trim()) out.push('Add a short summary.')
  if (c.seasons.length === 0) out.push('Add at least one season with a price.')
  c.seasons.forEach((s) => {
    if (!s.name.trim()) out.push('Every season needs a name.')
    if (s.pricePerPerson <= 0) out.push(`Enter a price for ${s.name || 'each season'}.`)
  })
  findSeasonOverlaps(c.seasons).forEach(([a, b]) => out.push(`${a} and ${b} share the same months. Seasons cannot overlap.`))
  if (c.itinerary.length === 0) out.push('Add at least one day to the itinerary.')
  if (c.itinerary.some((d) => !d.title.trim())) out.push('Every day needs a title.')
  if (!c.coverImage && c.gallery.length === 0) out.push('Add at least one photo.')
  if (c.hotels.length === 0) out.push('Add at least one hotel.')
  if (c.inclusions.length === 0) out.push('List what is included.')
  return out
}

const rand = () => Math.random().toString(36).slice(2, 6)
export const newCode = () => `PKG-NEW-${rand().toUpperCase()}`

export function blankPackage(): PackageContent {
  const code = newCode()
  return {
    code, slug: `untitled-${rand()}`, title: 'Untitled package', summary: '', tag: '', days: 1, nights: 0, hotelStars: 4,
    destinations: [], coverImage: '', gallery: [],
    seasons: [
      { name: 'Peak', fromMonth: 10, toMonth: 3, pricePerPerson: 0 },
      { name: 'Monsoon', fromMonth: 6, toMonth: 9, pricePerPerson: 0 },
    ],
    itinerary: [{ day: 1, title: '', description: '', stay: '', meals: ['Dinner'] }],
    inclusions: ['Accommodation on twin sharing', 'Daily breakfast and dinner', 'Private air-conditioned vehicle with driver'],
    exclusions: ['Flights and train fares', 'Lunch and personal expenses'],
    hotels: [], routeStops: [],
    cancellationNote: 'Dates can be changed free of charge up to 30 days before travel. Cancellation charges apply after that and are confirmed in your quote.',
    updatedAt: new Date().toISOString(), updatedBy: '',
  }
}
