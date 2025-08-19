export function formatCurrencyBDT(amount: number) {
  // Always render the Taka symbol on the LEFT, with locale digits/grouping.
  const n = Number.isFinite(amount) ? amount : 0
  const opts: Intl.NumberFormatOptions = {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }
  for (const locale of ['bn-BD', 'en-BD', 'en-IN']) {
    try {
      const num = new Intl.NumberFormat(locale, opts).format(n)
      return `৳${num}`
    } catch {}
  }
  const fixed = n.toFixed(2)
  return `৳${fixed}`
}

// Also provide a default export for compatibility with various import styles
export default formatCurrencyBDT
