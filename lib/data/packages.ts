import { packages } from '@/lib/mock-data'
import { seasonCoversMonth } from '@/lib/pricing'
import type { TourPackage } from '@/lib/types'

export type Duration = 'short' | 'mid' | 'long'
export type PackageFilters = { q?: string; destination?: string; duration?: Duration; stars?: number; month?: number; season?: string }

export const durationBand = (days: number): Duration => (days <= 4 ? 'short' : days <= 7 ? 'mid' : 'long')

// Swap these three functions for Supabase queries in the next phase; callers stay the same.
// Only published packages are ever returned to the public site.
const published = () => packages.filter((p) => p.status === 'published')

export async function getPublishedPackages(f: PackageFilters = {}): Promise<TourPackage[]> {
  const q = f.q?.trim().toLowerCase()
  return published().filter((p) => {
    if (q && !`${p.title} ${p.summary} ${p.destinations.join(' ')}`.toLowerCase().includes(q)) return false
    if (f.destination && !p.destinations.includes(f.destination)) return false
    if (f.stars && p.hotelStars < f.stars) return false
    if (f.duration && durationBand(p.days) !== f.duration) return false
    if (f.season && !p.seasons.some((s) => s.name === f.season)) return false
    if (f.month && !p.seasons.some((s) => seasonCoversMonth(s, f.month as number))) return false
    return true
  })
}

export async function getPackageBySlug(slug: string): Promise<TourPackage | null> {
  return published().find((p) => p.slug === slug) ?? null
}

export async function getDestinations(): Promise<string[]> {
  return [...new Set(published().flatMap((p) => p.destinations))].sort()
}
