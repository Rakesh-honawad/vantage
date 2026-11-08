import type { SeasonPrice, TourPackage } from './types'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const formatINR = (n: number) => inr.format(n)

/** Every displayed price carries this basis (brief: per person, twin sharing, GST). */
export const PRICE_BASIS = 'per person \u00b7 twin sharing \u00b7 + GST'

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function seasonCoversMonth(s: SeasonPrice, month: number): boolean {
  return s.fromMonth <= s.toMonth ? month >= s.fromMonth && month <= s.toMonth : month >= s.fromMonth || month <= s.toMonth
}

export function getSeasonForMonth(pkg: Pick<TourPackage, 'seasons'>, month: number): SeasonPrice | undefined {
  return pkg.seasons.find((s) => seasonCoversMonth(s, month))
}

/** The only source of prices: the package's own season table. */
export function getSeasonPrice(pkg: Pick<TourPackage, 'seasons'>, seasonName: string): number | undefined {
  return pkg.seasons.find((s) => s.name === seasonName)?.pricePerPerson
}

export function lowestPrice(pkg: Pick<TourPackage, 'seasons'>): number {
  return Math.min(...pkg.seasons.map((s) => s.pricePerPerson))
}

export function seasonRange(s: SeasonPrice): string {
  return s.fromMonth === 1 && s.toMonth === 12 ? 'All year' : `${MONTH_NAMES[s.fromMonth - 1]} to ${MONTH_NAMES[s.toMonth - 1]}`
}

/** Pairs of season names that share a month. Used by the CMS editor to block bad saves. */
export function findSeasonOverlaps(seasons: SeasonPrice[]): [string, string][] {
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const out: [string, string][] = []
  for (let i = 0; i < seasons.length; i++)
    for (let j = i + 1; j < seasons.length; j++)
      if (months.some((m) => seasonCoversMonth(seasons[i], m) && seasonCoversMonth(seasons[j], m))) out.push([seasons[i].name, seasons[j].name])
  return out
}

export function hasPricingGap(pkg: Pick<TourPackage, 'seasons'>): boolean {
  return Array.from({ length: 12 }, (_, i) => i + 1).some((m) => !getSeasonForMonth(pkg, m))
}
