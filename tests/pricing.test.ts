import { describe, it, expect } from 'vitest'
import { seasonCoversMonth, getSeasonForMonth, findSeasonOverlaps, hasPricingGap } from '@/lib/pricing'

const peak = { name: 'Peak', fromMonth: 10, toMonth: 3, pricePerPerson: 32500 }
const monsoon = { name: 'Monsoon', fromMonth: 6, toMonth: 9, pricePerPerson: 24900 }

describe('pricing seasons', () => {
  it('handles a season that wraps over the new year', () => {
    expect(seasonCoversMonth(peak, 12)).toBe(true)
    expect(seasonCoversMonth(peak, 2)).toBe(true)
    expect(seasonCoversMonth(peak, 7)).toBe(false)
  })
  it('picks the right season price for a month', () => {
    expect(getSeasonForMonth({ seasons: [peak, monsoon] } as any, 7)?.pricePerPerson).toBe(24900)
  })
  it('detects overlapping seasons', () => {
    expect(findSeasonOverlaps([peak, { ...monsoon, fromMonth: 3, toMonth: 9 }])).toHaveLength(1)
    expect(findSeasonOverlaps([peak, monsoon])).toHaveLength(0)
  })
  it('detects months with no price (April, May)', () => {
    expect(hasPricingGap({ seasons: [peak, monsoon] } as any)).toBe(true)
  })
})