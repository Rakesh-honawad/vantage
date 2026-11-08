import type { RouteStop } from '@/lib/types'

/** Simple schematic route from stop coordinates. No map provider, no key, nothing to load. */
export function RouteMap({ stops }: { stops: RouteStop[] }) {
  if (stops.length < 2) return null
  const lats = stops.map((s) => s.lat)
  const lngs = stops.map((s) => s.lng)
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)]
  const W = 520, H = 360, pad = 56
  const x = (lng: number) => pad + ((lng - minLng) / (maxLng - minLng || 1)) * (W - 2 * pad)
  const y = (lat: number) => H - pad - ((lat - minLat) / (maxLat - minLat || 1)) * (H - 2 * pad)
  return (
    <figure className="route-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Route: ${stops.map((s) => s.name).join(', ')}`}>
        <polyline points={stops.map((s) => `${x(s.lng)},${y(s.lat)}`).join(' ')} fill="none" stroke="#B08D4F" strokeWidth="1.5" strokeDasharray="4 5" />
        {stops.map((s) => {
          const right = x(s.lng) > W * 0.6
          return (
            <g key={s.name}>
              <circle cx={x(s.lng)} cy={y(s.lat)} r="5" fill="#24403A" />
              <text x={x(s.lng) + (right ? -11 : 11)} y={y(s.lat) + 4} textAnchor={right ? 'end' : 'start'}>{s.name}</text>
            </g>
          )
        })}
      </svg>
      <figcaption>Schematic route, not to scale</figcaption>
    </figure>
  )
}
