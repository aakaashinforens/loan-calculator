// Lender rate cards.
//
// ─────────────────────────────────────────────────────────────────────────────
// DATA PROVENANCE — read this before trusting any number downstream.
//
// CONFIRMED by the client (rate-range table, supplied 2026-08-25):
//   rate_min, rate_max, processing_fee_*, collateral_required,
//   collateral_threshold_inr
//
// STILL PLACEHOLDER — my values, not sourced:
//   moratorium_type, moratorium_grace_months, partial_interest_pct,
//   max_repayment_tenure_years, rate_type
//
// The moratorium fields are the ones that matter most: they decide the
// effective principal the EMI is built on, so every EMI and total-interest
// figure the tool produces is provisional until they are confirmed.
// See `DATA_PROVENANCE` below — the UI reads it to render a warning.
// ─────────────────────────────────────────────────────────────────────────────
//
// Field names deliberately match the agreed JSON contract (snake_case) rather
// than the codebase's camelCase, so a record can be dropped in verbatim from a
// spreadsheet export or a rates API without a translation layer.
//
// SCHEMA EXTENSION: `processing_fee_pct_max` was added to the agreed contract.
// The supplied table quotes NBFC fees as a RANGE ("1.00–1.50%"), which the
// single `processing_fee_pct` field cannot hold. Picking one end would either
// understate or overstate cost, so the fee now follows the same best/worst
// convention as the rate band. Null means the fee is single-valued.

/** Which parts of `LENDERS` are sourced and which are still guesses. */
export const DATA_PROVENANCE = {
  /** Date the client supplied the rate-range table. Not an independent check. */
  ratesSuppliedOn: '2026-08-25',
  confirmed: [
    'rate_min / rate_max',
    'processing fees',
    'collateral requirement',
  ],
  unconfirmed: [
    'moratorium_type',
    'moratorium_grace_months',
    'partial_interest_pct',
    'max_repayment_tenure_years',
    'rate_type',
  ],
} as const;

/** True while any field group is still placeholder data. */
export const HAS_UNCONFIRMED_FIELDS = DATA_PROVENANCE.unconfirmed.length > 0;

/** A quote older than this is flagged in the UI as needing re-verification. */
export const STALE_AFTER_DAYS = 90;

export type LenderCategory = 'PSU' | 'Private' | 'NBFC';

/**
 * How a lender treats collateral.
 * - `above_threshold` — security demanded once the loan exceeds
 *   `collateral_threshold_inr`. The classic PSU ₹7.5L rule.
 * - `case_by_case`   — no published rule; depends on institute, course and
 *   co-applicant profile. Cannot be resolved by a calculator.
 * - `none`           — the lender writes this size of loan unsecured.
 */
export type CollateralRequirement = 'above_threshold' | 'case_by_case' | 'none';

/**
 * What the borrower owes during the moratorium.
 * - `full_capitalized`          — nothing is paid; interest compounds into the
 *   principal that the EMI is later computed on.
 * - `simple_interest_serviced`  — the full monthly interest is paid as it
 *   accrues, so the principal is untouched when repayment starts.
 * - `partial_interest_serviced` — a fixed share (`partial_interest_pct`) of the
 *   monthly interest is paid.
 */
export type MoratoriumType =
  | 'full_capitalized'
  | 'simple_interest_serviced'
  | 'partial_interest_serviced';

export type RateType = 'floating' | 'fixed';

export interface Lender {
  /** Stable slug — React keys, lookups, lead payloads. Not part of the feed. */
  id: string;
  lender: string;
  category: LenderCategory;
  /** %, best case within the published band (secured + strong co-applicant). */
  rate_min: number;
  /** %, the lender's published ceiling for the product. */
  rate_max: number;
  collateral_required: CollateralRequirement;
  /** Only meaningful when `collateral_required` is `above_threshold`. */
  collateral_threshold_inr: number | null;
  /** % of sanctioned amount — the low end when the lender quotes a range. */
  processing_fee_pct: number | null;
  /** High end of a quoted fee range. Null when the fee is single-valued. */
  processing_fee_pct_max: number | null;
  /** Flat ₹ fee. Null when the lender charges a percentage. */
  processing_fee_flat_inr: number | null;
  /** Upper bound on the computed fee, in ₹. Null when uncapped. */
  processing_fee_cap_inr: number | null;
  moratorium_type: MoratoriumType;
  /** Post-course grace before repayment starts. Varies 6–12 by lender/scheme. */
  moratorium_grace_months: number;
  /** Share of moratorium interest serviced, e.g. 50. Null unless partial. */
  partial_interest_pct: number | null;
  /** Repayment period only, AFTER the moratorium ends. */
  max_repayment_tenure_years: number;
  rate_type: RateType;
  /** ISO date the rate card was last checked against the source. */
  last_verified: string;

  // ── Balance-transfer data, orthogonal to the rate card above ──────────────
  accepts_balance_transfer: boolean;
  balance_transfer_rate_typical: number;
  eligibility_notes: string[];
}

const SUPPLIED = '2026-08-25';

export const LENDERS: Lender[] = [
  // ── PSU ────────────────────────────────────────────────────────────────────
  // All four: 0.50% processing fee capped at ₹10,000; collateral above ₹7.5L.
  {
    id: 'bob',
    lender: 'Bank of Baroda',
    category: 'PSU',
    rate_min: 8.85,
    rate_max: 9.85,
    collateral_required: 'above_threshold',
    collateral_threshold_inr: 750_000,
    processing_fee_pct: 0.5,
    processing_fee_pct_max: null,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: 10_000,
    moratorium_type: 'full_capitalized',
    moratorium_grace_months: 12,
    partial_interest_pct: null,
    max_repayment_tenure_years: 15,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: false,
    balance_transfer_rate_typical: 8.75,
    eligibility_notes: ['Good repayment record for BT', 'Listed universities only'],
  },
  {
    id: 'pnb',
    lender: 'Punjab National Bank',
    category: 'PSU',
    rate_min: 8.9,
    rate_max: 9.9,
    collateral_required: 'above_threshold',
    collateral_threshold_inr: 750_000,
    processing_fee_pct: 0.5,
    processing_fee_pct_max: null,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: 10_000,
    moratorium_type: 'full_capitalized',
    moratorium_grace_months: 6,
    partial_interest_pct: null,
    max_repayment_tenure_years: 15,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: true,
    balance_transfer_rate_typical: 8.0,
    eligibility_notes: [
      'Clear repayment history required',
      'Balance transfer for rate reduction or loan enhancement',
    ],
  },
  {
    id: 'sbi',
    lender: 'State Bank of India',
    category: 'PSU',
    rate_min: 9.0,
    rate_max: 10.0,
    collateral_required: 'above_threshold',
    collateral_threshold_inr: 750_000,
    processing_fee_pct: 0.5,
    processing_fee_pct_max: null,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: 10_000,
    moratorium_type: 'full_capitalized',
    moratorium_grace_months: 6,
    partial_interest_pct: null,
    max_repayment_tenure_years: 15,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: true,
    balance_transfer_rate_typical: 8.0,
    eligibility_notes: [
      'Clear repayment history required',
      'Balance transfer for rate reduction or loan enhancement',
      'Minimum outstanding amount requirement',
    ],
  },
  {
    id: 'canara',
    lender: 'Canara Bank',
    category: 'PSU',
    rate_min: 9.1,
    rate_max: 10.1,
    collateral_required: 'above_threshold',
    collateral_threshold_inr: 750_000,
    processing_fee_pct: 0.5,
    processing_fee_pct_max: null,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: 10_000,
    moratorium_type: 'full_capitalized',
    // Canara's scheme is commonly course duration + 1 year (Section 3).
    moratorium_grace_months: 12,
    partial_interest_pct: null,
    max_repayment_tenure_years: 15,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: false,
    balance_transfer_rate_typical: 8.75,
    eligibility_notes: ['Clear repayment history for BT', 'Approved institutions only'],
  },

  // ── Private ────────────────────────────────────────────────────────────────
  // All three: 1.00% processing fee, uncapped; collateral case-by-case.
  {
    id: 'axis',
    lender: 'Axis Bank',
    category: 'Private',
    rate_min: 10.5,
    rate_max: 11.5,
    collateral_required: 'case_by_case',
    collateral_threshold_inr: null,
    processing_fee_pct: 1.0,
    processing_fee_pct_max: null,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
    moratorium_type: 'simple_interest_serviced',
    moratorium_grace_months: 6,
    partial_interest_pct: null,
    max_repayment_tenure_years: 15,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: true,
    balance_transfer_rate_typical: 9.0,
    eligibility_notes: [
      'Clear repayment history required',
      'Rate reduction of 1–1.25% typical on transfer',
    ],
  },
  {
    id: 'icici',
    lender: 'ICICI Bank',
    category: 'Private',
    rate_min: 10.75,
    rate_max: 11.75,
    collateral_required: 'case_by_case',
    collateral_threshold_inr: null,
    processing_fee_pct: 1.0,
    processing_fee_pct_max: null,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
    moratorium_type: 'partial_interest_serviced',
    moratorium_grace_months: 6,
    partial_interest_pct: 50,
    max_repayment_tenure_years: 12,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: false,
    balance_transfer_rate_typical: 9.25,
    eligibility_notes: [
      'Credit score 720+ preferred',
      'Unsecured limits depend heavily on institute tier',
    ],
  },
  {
    id: 'idfc',
    lender: 'IDFC First Bank',
    category: 'Private',
    rate_min: 11.0,
    rate_max: 12.0,
    collateral_required: 'case_by_case',
    collateral_threshold_inr: null,
    processing_fee_pct: 1.0,
    processing_fee_pct_max: null,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
    moratorium_type: 'partial_interest_serviced',
    moratorium_grace_months: 12,
    partial_interest_pct: 50,
    max_repayment_tenure_years: 10,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: true,
    balance_transfer_rate_typical: 9.0,
    eligibility_notes: ['Clear repayment history required', 'Academic credentials weighted highly'],
  },

  // ── NBFC ───────────────────────────────────────────────────────────────────
  // All five: 1.00–1.50% processing fee, uncapped; collateral case-by-case.
  {
    id: 'credila',
    lender: 'HDFC Credila',
    category: 'NBFC',
    rate_min: 10.9,
    rate_max: 12.5,
    collateral_required: 'case_by_case',
    collateral_threshold_inr: null,
    processing_fee_pct: 1.0,
    processing_fee_pct_max: 1.5,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
    moratorium_type: 'simple_interest_serviced',
    moratorium_grace_months: 12,
    partial_interest_pct: null,
    max_repayment_tenure_years: 15,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: true,
    balance_transfer_rate_typical: 9.75,
    eligibility_notes: [
      'Clear repayment history required',
      'Applicant academics weighted highly',
      'Co-applicant income important if applicant not employed',
    ],
  },
  {
    id: 'avanse',
    lender: 'Avanse Financial Services',
    category: 'NBFC',
    rate_min: 11.0,
    rate_max: 12.75,
    collateral_required: 'case_by_case',
    collateral_threshold_inr: null,
    processing_fee_pct: 1.0,
    processing_fee_pct_max: 1.5,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
    moratorium_type: 'partial_interest_serviced',
    moratorium_grace_months: 12,
    partial_interest_pct: 50,
    max_repayment_tenure_years: 12,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: false,
    balance_transfer_rate_typical: 10.0,
    eligibility_notes: ['Flexible repayment options', 'Co-applicant income considered'],
  },
  {
    id: 'auxilo',
    lender: 'Auxilo Finserve',
    category: 'NBFC',
    rate_min: 11.15,
    rate_max: 12.9,
    collateral_required: 'case_by_case',
    collateral_threshold_inr: null,
    processing_fee_pct: 1.0,
    processing_fee_pct_max: 1.5,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
    moratorium_type: 'partial_interest_serviced',
    moratorium_grace_months: 6,
    partial_interest_pct: 50,
    max_repayment_tenure_years: 12,
    rate_type: 'floating',
    last_verified: SUPPLIED,
    accepts_balance_transfer: false,
    balance_transfer_rate_typical: 10.0,
    eligibility_notes: ['Academics and income considered', 'Quick processing'],
  },
  {
    id: 'tata-capital',
    lender: 'Tata Capital',
    category: 'NBFC',
    rate_min: 11.35,
    rate_max: 13.0,
    collateral_required: 'case_by_case',
    collateral_threshold_inr: null,
    processing_fee_pct: 1.0,
    processing_fee_pct_max: 1.5,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
    moratorium_type: 'full_capitalized',
    moratorium_grace_months: 12,
    partial_interest_pct: null,
    max_repayment_tenure_years: 10,
    rate_type: 'fixed',
    last_verified: SUPPLIED,
    accepts_balance_transfer: false,
    balance_transfer_rate_typical: 10.0,
    eligibility_notes: ['Comprehensive eligibility check', 'Fast processing'],
  },
  {
    id: 'poonawalla',
    lender: 'Poonawalla Fincorp',
    category: 'NBFC',
    rate_min: 11.5,
    rate_max: 13.25,
    collateral_required: 'case_by_case',
    collateral_threshold_inr: null,
    processing_fee_pct: 1.0,
    processing_fee_pct_max: 1.5,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
    moratorium_type: 'partial_interest_serviced',
    moratorium_grace_months: 6,
    partial_interest_pct: 100,
    max_repayment_tenure_years: 10,
    rate_type: 'fixed',
    last_verified: SUPPLIED,
    accepts_balance_transfer: false,
    balance_transfer_rate_typical: 10.0,
    eligibility_notes: ['Overall profile assessment', 'Quick approval'],
  },
];

export function getLenderById(id: string): Lender | undefined {
  return LENDERS.find((l) => l.id === id);
}

export function getLenderName(id: string): string {
  return getLenderById(id)?.lender ?? 'Unknown lender';
}

export function getLendersByCategory(category: LenderCategory): Lender[] {
  return LENDERS.filter((l) => l.category === category);
}

/** Which end of a quoted fee range to price. */
export type FeeEnd = 'min' | 'max';

/**
 * Processing fee for a given sanctioned amount, in ₹.
 * A lender charges either a flat fee or a percentage (possibly a range); the
 * cap, when present, applies to whichever was computed.
 */
export function processingFeeFor(
  lender: Lender,
  principal: number,
  end: FeeEnd = 'min'
): number {
  if (lender.processing_fee_flat_inr !== null) {
    const flat = lender.processing_fee_flat_inr;
    return lender.processing_fee_cap_inr !== null
      ? Math.min(flat, lender.processing_fee_cap_inr)
      : flat;
  }

  const lowPct = lender.processing_fee_pct ?? 0;
  const pct = end === 'max' ? (lender.processing_fee_pct_max ?? lowPct) : lowPct;
  const raw = (pct / 100) * principal;

  return lender.processing_fee_cap_inr !== null
    ? Math.min(raw, lender.processing_fee_cap_inr)
    : raw;
}

/** Human-readable fee basis, e.g. "1.00–1.50%" or "0.50% (max ₹10,000)". */
export function processingFeeBasis(lender: Lender): string {
  if (lender.processing_fee_flat_inr !== null) {
    return `₹${lender.processing_fee_flat_inr.toLocaleString('en-IN')} flat`;
  }

  const low = lender.processing_fee_pct ?? 0;
  const pct =
    lender.processing_fee_pct_max !== null && lender.processing_fee_pct_max !== low
      ? `${low.toFixed(2)}–${lender.processing_fee_pct_max.toFixed(2)}%`
      : `${low.toFixed(2)}%`;

  return lender.processing_fee_cap_inr !== null
    ? `${pct} (max ₹${lender.processing_fee_cap_inr.toLocaleString('en-IN')})`
    : pct;
}

/** Whole days between `last_verified` and `asOf`. Negative dates clamp to 0. */
export function daysSinceVerified(lender: Lender, asOf: Date = new Date()): number {
  const verified = new Date(`${lender.last_verified}T00:00:00Z`);
  if (Number.isNaN(verified.getTime())) return Number.POSITIVE_INFINITY;
  const ms = asOf.getTime() - verified.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function isStale(lender: Lender, asOf: Date = new Date()): boolean {
  return daysSinceVerified(lender, asOf) > STALE_AFTER_DAYS;
}
