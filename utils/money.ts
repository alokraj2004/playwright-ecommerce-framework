/** Rounds to 2 decimal places to avoid floating-point comparison flakiness in totals. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** SauceDemo applies a fixed 8% tax rate to the cart subtotal. */
export function calculateTax(subtotal: number, rate = 0.08): number {
  return round2(subtotal * rate);
}
