'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { MONTH_NAMES } from '@/lib/pricing'

/** Filters live in the URL, so results are shareable and rendered on the server. */
export function PackageFilters({ destinations, count }: { destinations: string[]; count: number }) {
  const router = useRouter()
  const path = usePathname()
  const params = useSearchParams()
  const [pending, start] = useTransition()
  const [q, setQ] = useState(params.get('q') ?? '')

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    start(() => router.replace(qs ? `${path}?${qs}` : path, { scroll: false }))
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') !== q) update('q', q)
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const get = (k: string) => params.get(k) ?? ''
  const active = ['q', 'destination', 'month', 'duration', 'stars', 'season'].some((k) => params.get(k))

  return (
    <div className="filters" aria-busy={pending}>
      <input aria-label="Search packages" placeholder="Search places or journeys" value={q} onChange={(e) => setQ(e.target.value)} />
      <select aria-label="Destination" value={get('destination')} onChange={(e) => update('destination', e.target.value)}>
        <option value="">Any destination</option>
        {destinations.map((d) => <option key={d}>{d}</option>)}
      </select>
      <select aria-label="Month of travel" value={get('month')} onChange={(e) => update('month', e.target.value)}>
        <option value="">Any month</option>
        {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select aria-label="Duration" value={get('duration')} onChange={(e) => update('duration', e.target.value)}>
        <option value="">Any length</option>
        <option value="short">Up to 4 days</option>
        <option value="mid">5 to 7 days</option>
        <option value="long">8 days or more</option>
      </select>
      <select aria-label="Hotel stars" value={get('stars')} onChange={(e) => update('stars', e.target.value)}>
        <option value="">Any hotel</option>
        <option value="3">3 star and above</option>
        <option value="4">4 star and above</option>
        <option value="5">5 star</option>
      </select>
      {active && <Link href="/packages" className="clear">Clear</Link>}
      <span className="mono" role="status">{count} {count === 1 ? 'journey' : 'journeys'}</span>
    </div>
  )
}
