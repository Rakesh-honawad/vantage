import { PRICE_BASIS, formatINR } from '@/lib/pricing'

export function Price({ amount, from = false }: { amount: number; from?: boolean }) {
  return (
    <div className="price">
      <strong>{formatINR(amount)}</strong>
      <span>{from && 'from \u00b7 '}{PRICE_BASIS}</span>
    </div>
  )
}
