/**
 * Formats a numeric value into the Indian numbering system currency representation.
 * Example: 1500000 -> ₹15,00,000
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}
