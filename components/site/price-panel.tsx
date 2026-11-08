'use client'

import { useState } from 'react'
import { PRICE_BASIS, formatINR, seasonRange } from '@/lib/pricing'
import type { SeasonPrice } from '@/lib/types'
import { Btn } from './btn'
import { Price } from './price'

const tone = (name: string) => (name.toLowerCase().includes('monsoon') ? 'monsoon' : 'peak')

/** Season toggle and price. Prices come only from the package's season table. */
export function PricePanel({ seasons }: { seasons: SeasonPrice[] }) {
  const [active, setActive] = useState(0)
  const s = seasons[active]
  return (
    <>
      <aside className="price-panel">
        <span className="mono">Choose your season</span>
        {seasons.length > 1 && (
          <div className="toggle" role="tablist" aria-label="Season">
            {seasons.map((x, i) => (
              <button key={x.name} role="tab" aria-selected={i === active} data-tone={tone(x.name)} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>
                {x.name}
              </button>
            ))}
          </div>
        )}
        <Price amount={s.pricePerPerson} />
        <p className="date-range">{seasonRange(s)}</p>
        <Btn href="#enquire">Enquire about this journey</Btn>
        <small>Prices are indicative and confirmed in your quote.</small>
      </aside>
      <div className="mobile-bar">
        <div><strong>{formatINR(s.pricePerPerson)}</strong><span>{PRICE_BASIS}</span></div>
        <Btn href="#enquire">Enquire</Btn>
      </div>
    </>
  )
}
