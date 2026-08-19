const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format a rupee amount with Indian lakh/crore grouping, e.g. ₹15,85,800. */
export function formatINR(amount: number): string {
  return inr.format(Math.round(amount));
}

/** Compact ₹ label for axes/badges, e.g. ₹10 L, ₹1.5 Cr. */
export function formatINRCompact(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2).replace(/\.00$/, "")} L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)} K`;
  return `₹${Math.round(amount)}`;
}
