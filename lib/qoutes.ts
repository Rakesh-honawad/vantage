export type QuoteTotals = {
  subtotal: number
  gst: number
  total: number
}

export function calculateQuoteTotal({
  adults,
  children,
  pricePerPerson,
  gstRate = 0.05,
}: {
  adults: number
  children: number
  pricePerPerson: number
  gstRate?: number
}): QuoteTotals {
  const subtotal =
    adults * pricePerPerson +
    children * pricePerPerson * 0.6

  const gst = subtotal * gstRate

  return {
    subtotal,
    gst,
    total: subtotal + gst,
  }
}