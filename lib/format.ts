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

/** Range label for a lender's published band, e.g. "8.05% – 10.15%". */
export function formatRateBand(min: number, max: number): string {
  if (min === max) return `${min.toFixed(2)}%`;
  return `${min.toFixed(2)}% – ${max.toFixed(2)}%`;
}

/** Range of rupee amounts, e.g. "₹15,323 – ₹17,204". */
export function formatINRRange(low: number, high: number): string {
  if (Math.round(low) === Math.round(high)) return formatINR(low);
  return `${formatINR(low)} – ${formatINR(high)}`;
}

/** "30 months (2 yr 6 mo)" style duration label. */
export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${months} mo`;
  if (rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}

/** Plain-English summary of what is owed during the moratorium. */
export function formatMoratoriumType(
  type: "full_capitalized" | "simple_interest_serviced" | "partial_interest_serviced",
  partialPct: number | null
): string {
  switch (type) {
    case "simple_interest_serviced":
      return "Full interest serviced monthly";
    case "partial_interest_serviced":
      return `${partialPct ?? 0}% of interest serviced monthly`;
    case "full_capitalized":
    default:
      return "Nothing paid; interest capitalised";
  }
}

/** "24 days ago", "today", "over a year ago". */
export function formatDaysAgo(days: number): string {
  if (!Number.isFinite(days)) return "never";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 60) return `${days} days ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return "over a year ago";
}
