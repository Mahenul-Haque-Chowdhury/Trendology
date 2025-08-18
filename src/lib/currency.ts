export function formatCurrencyBDT(amount: number) {
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
  for (const locale of ['bn-BD', 'en-BD']) {
    try {
      return new Intl.NumberFormat(locale, opts).format(amount)
    } catch {}
  }
  const fixed = (Number.isFinite(amount) ? amount : 0).toFixed(2)
  return `৳${fixed}`
}

// Also provide a default export for compatibility with various import styles
export default formatCurrencyBDT
