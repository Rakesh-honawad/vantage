import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
const askLLM = vi.fn()
vi.mock('@/lib/ai/llm', () => ({ askLLM: (...a: unknown[]) => askLLM(...a) }))

import { extractWithRules, extractEnquiry, writeIntro } from '@/lib/ai/extract'

const SAMPLE = 'Hi, 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, houseboat a must'
beforeEach(() => askLLM.mockReset())

describe('extractWithRules', () => {
  it('reads the brief\'s sample enquiry', () => {
    const r = extractWithRules(SAMPLE, ['Munnar'])
    expect(r).toMatchObject({ adults: 2, children: 1, month: 12, nights: 5, nightsMax: 6, budgetTotal: 120000 })
    expect(r.interests).toContain('houseboat')
  })
  it('parses "family of 4"', () => {
    const r = extractWithRules('Family of 4 wants Munnar in May', ['Munnar'])
    expect(r.adults).toBe(2)
    expect(r.children).toBe(2)
  })
  it('does not read "tea" inside "team"', () => {
    expect(extractWithRules('Our team outing, 10 people', []).interests).not.toContain('tea')
    expect(extractWithRules('Tea garden walk please', []).interests).toContain('tea')
  })
  it('multiplies a per-person budget by group size', () => {
    expect(extractWithRules('2 adults, budget 50k per person', []).budgetTotal).toBe(100000)
  })
  it('returns nulls for a vague message', () => {
    expect(extractWithRules('hello', [])).toMatchObject({ adults: null, month: null, nights: null, budgetTotal: null })
  })
})

describe('extractEnquiry fallback', () => {
  it('uses rules when there is no AI answer', async () => {
    askLLM.mockResolvedValue(null)
    expect((await extractEnquiry(SAMPLE, [])).source).toBe('rules')
  })
  it('uses rules when the AI returns bad JSON', async () => {
    askLLM.mockResolvedValue('sorry I cannot do that')
    const r = await extractEnquiry(SAMPLE, [])
    expect(r.source).toBe('rules')
    expect(r.data.adults).toBe(2)
  })
  it('uses the AI answer when it is valid', async () => {
    askLLM.mockResolvedValue(JSON.stringify({ adults: 3, children: null, month: 1, nights: 4, nightsMax: null, budgetTotal: null, destinations: [], interests: [] }))
    const r = await extractEnquiry(SAMPLE, [])
    expect(r.source).toBe('ai')
    expect(r.data.adults).toBe(3)
  })
})

describe('writeIntro guard', () => {
  it('rejects an intro that mentions a price or promise', async () => {
    for (const bad of ['Great deal, only ₹5000!', 'We guarantee the best offer.', 'Packages start at 25000.']) {
      askLLM.mockResolvedValue(bad)
      expect(await writeIntro('hi')).toBeNull()
    }
  })
  it('accepts a clean intro', async () => {
    askLLM.mockResolvedValue('A Kerala houseboat stay sounds lovely for your family.')
    expect(await writeIntro('hi')).toContain('houseboat')
  })
})