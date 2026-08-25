// Core education-loan math, per the Excel spec (Sheet2 "Core EMI formula").
// EMI = P * r * (1+r)^n / ((1+r)^n - 1), with r = annualRate/12/100 and n = tenureYears*12.
//
// Education loans are not plain term loans: repayment only begins after a
// MORATORIUM (course duration + a lender-specific grace period). What the
// borrower owes during that window — nothing, all of the interest, or a slice
// of it — is the single biggest driver of the final number, so it is modelled
// explicitly here rather than being folded into the tenure.
//
// Lenders quote a BAND, not a point. Every comparison therefore produces two
// results per lender: the best case at `rate_min` and the worst at `rate_max`.

import {
  daysSinceVerified,
  isStale,
  Lender,
  MoratoriumType,
  processingFeeBasis,
  processingFeeFor,
} from "./lenders";

/** Allowed input ranges, from the Excel (Sheet1/Sheet2). */
export const LOAN_LIMITS = {
  amount: { min: 50_000, max: 30_000_000, step: 10_000 }, // ₹50k – ₹3 Cr
  /** Post-moratorium repayment period only. 15 yr is the highest any lender allows. */
  tenureYears: { min: 1, max: 15, step: 1 },
  /** Course length, in months (6 months – 6 years). Drives the moratorium. */
  courseDurationMonths: { min: 6, max: 72, step: 1 },
  annualRate: { min: 7, max: 16, step: 0.05 }, // % p.a.
} as const;

/** Fallback grace period for loans quoted without a lender attached. */
export const GRACE_PERIOD_MONTHS = 6;

/**
 * OPEN QUESTION — affects `partial_interest_serviced` lenders only.
 *
 * The agreed spec says an interest-serviced moratorium leaves the principal
 * unchanged ("effective_principal = disbursed_principal"), and states that for
 * BOTH the full and partial cases. Taken literally, the share of interest a
 * partial-servicing borrower does NOT pay simply vanishes — which understates
 * their effective principal, and therefore their EMI and total interest.
 *
 * `false` (default) follows the spec as written.
 * `true` capitalises the unpaid share, which is how these products generally
 * behave in practice.
 *
 * At ₹10L / 30-month moratorium / 9.5% with 50% serviced, the two readings
 * differ by roughly ₹1.26L of effective principal — about 12.6% on the EMI —
 * so this is worth settling before the tool ranks lenders on total interest.
 */
export const PARTIAL_UNPAID_INTEREST_CAPITALISES = false;

/** Whether the borrower is offering collateral. Drives eligibility, not pricing. */
export type CollateralStatus = "secured" | "unsecured";

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Share of each month's moratorium interest the borrower actually pays.
 * Whatever is not paid capitalises.
 */
export function servicedFraction(
  type: MoratoriumType,
  partialInterestPct: number | null | undefined
): number {
  switch (type) {
    case "simple_interest_serviced":
      return 1;
    case "partial_interest_serviced":
      return clamp((partialInterestPct ?? 0) / 100, 0, 1);
    case "full_capitalized":
    default:
      return 0;
  }
}

export interface LoanInput {
  /** Principal, in ₹. */
  principal: number;
  /** Annual interest rate, as a percentage (e.g. 10 for 10% p.a.). */
  annualRate: number;
  /** Repayment tenure, in years — post-moratorium only, not total loan life. */
  tenureYears: number;
  /** Course length in months. Omit (or 0) for a loan with no study period. */
  courseDurationMonths?: number;
  /** Grace months after the course ends. Defaults to GRACE_PERIOD_MONTHS. */
  gracePeriodMonths?: number;
  /** Lender's moratorium treatment. Defaults to `full_capitalized`. */
  moratoriumType?: MoratoriumType;
  /** Share of moratorium interest serviced, when `partial_interest_serviced`. */
  partialInterestPct?: number | null;
}

export interface LoanResult {
  principal: number;
  /** Equated monthly instalment, in ₹. */
  emi: number;
  /** Everything the borrower pays: EMIs plus any interest serviced while studying. */
  totalPayment: number;
  /** Total payment − principal, in ₹. Excludes the processing fee. */
  totalInterest: number;
  /** Repayment tenure expressed in months (excludes the moratorium). */
  months: number;
  /** Course duration + grace, in months. */
  moratoriumMonths: number;
  /** Interest that builds up during the moratorium, in ₹, paid or not. */
  moratoriumInterest: number;
  /** Amount the EMI is computed on — principal plus any capitalised interest. */
  principalAtRepaymentStart: number;
  /** Interest actually paid out of pocket during the moratorium, in total. */
  moratoriumPayment: number;
  /** What the borrower pays each month DURING the moratorium. 0 when capitalised. */
  moratoriumMonthlyPayment: number;
  /** Moratorium + repayment, in months. The real life of the loan. */
  totalDurationMonths: number;
}

/**
 * Compute EMI, total payment, and total interest for an education loan.
 * Inputs are clamped to LOAN_LIMITS so downstream UI never renders garbage.
 * Handles the zero-interest edge case (EMI = principal / months).
 */
export function computeLoan(input: LoanInput): LoanResult {
  const principal = clamp(input.principal, LOAN_LIMITS.amount.min, LOAN_LIMITS.amount.max);
  const annualRate = clamp(input.annualRate, LOAN_LIMITS.annualRate.min, LOAN_LIMITS.annualRate.max);
  const tenureYears = clamp(input.tenureYears, LOAN_LIMITS.tenureYears.min, LOAN_LIMITS.tenureYears.max);

  const courseDurationMonths = Math.max(0, Math.round(input.courseDurationMonths ?? 0));
  const gracePeriodMonths = Math.max(
    0,
    Math.round(input.gracePeriodMonths ?? (courseDurationMonths > 0 ? GRACE_PERIOD_MONTHS : 0))
  );
  const moratoriumMonths = courseDurationMonths + gracePeriodMonths;
  const serviced = servicedFraction(
    input.moratoriumType ?? "full_capitalized",
    input.partialInterestPct
  );

  const months = Math.round(tenureYears * 12);
  const r = annualRate / 12 / 100;

  // Moratorium, per the agreed spec (Section 3).
  //
  //   full_capitalized  → nothing paid; interest compounds monthly and the
  //                       whole lot is added to principal:
  //                       effective = P × (1 + r) ^ moratorium_months
  //   *_serviced        → a flat share of the interest on the DISBURSED
  //                       principal is paid each month:
  //                       monthly = P × r × share
  //                       and the principal is left unchanged.
  let principalAtRepaymentStart: number;
  let moratoriumInterest: number;
  let moratoriumPayment: number;
  let moratoriumMonthlyPayment: number;

  if (moratoriumMonths === 0 || r === 0 || serviced === 0) {
    // Nothing is serviced: interest compounds into the principal.
    principalAtRepaymentStart =
      moratoriumMonths === 0 || r === 0
        ? principal
        : principal * Math.pow(1 + r, moratoriumMonths);
    moratoriumInterest = principalAtRepaymentStart - principal;
    moratoriumPayment = 0;
    moratoriumMonthlyPayment = 0;
  } else {
    moratoriumMonthlyPayment = principal * r * serviced;
    moratoriumPayment = moratoriumMonthlyPayment * moratoriumMonths;

    // Per spec, the principal is unchanged while interest is being serviced.
    // See PARTIAL_UNPAID_INTEREST_CAPITALISES for the partial-servicing caveat.
    const unpaidCapitalises = PARTIAL_UNPAID_INTEREST_CAPITALISES && serviced < 1;
    principalAtRepaymentStart = unpaidCapitalises
      ? principal * Math.pow(1 + r * (1 - serviced), moratoriumMonths)
      : principal;

    moratoriumInterest = moratoriumPayment + (principalAtRepaymentStart - principal);
  }

  let emi: number;
  if (r === 0) {
    emi = principalAtRepaymentStart / months;
  } else {
    const growth = Math.pow(1 + r, months);
    emi = (principalAtRepaymentStart * r * growth) / (growth - 1);
  }

  const totalPayment = emi * months + moratoriumPayment;
  const totalInterest = totalPayment - principal;

  return {
    principal,
    emi,
    totalPayment,
    totalInterest,
    months,
    moratoriumMonths,
    moratoriumInterest,
    principalAtRepaymentStart,
    moratoriumPayment,
    moratoriumMonthlyPayment,
    totalDurationMonths: moratoriumMonths + months,
  };
}

// ─── Lender comparison ───────────────────────────────────────────────────────

/** One end of a lender's quoted band. */
export interface QuoteEnd extends LoanResult {
  /** The rate this end was priced at, as a percentage. */
  rate: number;
  /** totalPayment + processing fee. What actually leaves the borrower's hands. */
  totalCost: number;
}

export interface LenderQuote {
  lender: Lender;
  lenderId: string;
  lenderName: string;
  /** Priced at `rate_min` — the "starting from" case used for sorting. */
  best: QuoteEnd;
  /** Priced at `rate_max`. */
  worst: QuoteEnd;
  /** Processing fee in ₹ at the low end of the lender's quoted fee. */
  processingFeeMin: number;
  /** Processing fee in ₹ at the high end. Equal to min for a single-value fee. */
  processingFeeMax: number;
  /** How the fee is quoted, e.g. "1.00–1.50%" or "0.50% (max ₹10,000)". */
  processingFeeBasis: string;
  /** Repayment tenure actually used, after the lender's own ceiling. */
  tenureUsedYears: number;
  /** True when the requested tenure exceeded `max_repayment_tenure_years`. */
  tenureCapped: boolean;
  moratoriumMonths: number;
  /** False when the lender will not write this loan on these terms. */
  eligible: boolean;
  /** Why the lender was ruled out. Empty when eligible. */
  ineligibleReason: string;
  /** Caveat that does not rule the lender out, e.g. case-by-case collateral. */
  collateralNote: string;
  daysSinceVerified: number;
  stale: boolean;
}

export interface LenderComparisonInput {
  principal: number;
  /** Requested post-moratorium repayment tenure, in years. */
  tenureYears: number;
  courseDurationMonths?: number;
  /** Whether the borrower can offer collateral. Defaults to `secured`. */
  collateral?: CollateralStatus;
  /** Reference date for staleness. Injectable so tests are deterministic. */
  asOf?: Date;
}

/** Decide whether a lender will write this loan, and with what caveat. */
function assessCollateral(
  lender: Lender,
  principal: number,
  collateral: CollateralStatus
): { eligible: boolean; ineligibleReason: string; collateralNote: string } {
  if (collateral === "secured") {
    return { eligible: true, ineligibleReason: "", collateralNote: "" };
  }

  switch (lender.collateral_required) {
    case "none":
      return { eligible: true, ineligibleReason: "", collateralNote: "Lends unsecured" };

    case "case_by_case":
      return {
        eligible: true,
        ineligibleReason: "",
        collateralNote: "Case by case — depends on institute, course and co-applicant",
      };

    case "above_threshold": {
      const threshold = lender.collateral_threshold_inr ?? 0;
      if (principal <= threshold) {
        return { eligible: true, ineligibleReason: "", collateralNote: "Under collateral threshold" };
      }
      return {
        eligible: false,
        ineligibleReason: `Requires collateral above ${compactINR(threshold)}`,
        collateralNote: "",
      };
    }
  }
}

/** Compact ₹ label used in eligibility copy, e.g. ₹7.5L, ₹1.5Cr. */
function compactINR(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2).replace(/\.?0+$/, "")}Cr`;
  return `₹${(amount / 100_000).toFixed(1).replace(/\.0$/, "")}L`;
}

/** Quote a single lender across its published rate band. */
export function quoteLender(input: LenderComparisonInput, lender: Lender): LenderQuote {
  const collateral = input.collateral ?? "secured";
  const requestedTenure = input.tenureYears;
  const tenureUsedYears = Math.min(requestedTenure, lender.max_repayment_tenure_years);
  const tenureCapped = requestedTenure > lender.max_repayment_tenure_years;

  const shared = {
    principal: input.principal,
    tenureYears: tenureUsedYears,
    courseDurationMonths: input.courseDurationMonths,
    gracePeriodMonths: lender.moratorium_grace_months,
    moratoriumType: lender.moratorium_type,
    partialInterestPct: lender.partial_interest_pct,
  };

  // The fee is a range for some lenders, so it follows the same best/worst
  // convention as the rate band: cheapest fee with the cheapest rate.
  const processingFeeMin = processingFeeFor(lender, input.principal, "min");
  const processingFeeMax = processingFeeFor(lender, input.principal, "max");
  const price = (rate: number, fee: number): QuoteEnd => {
    const result = computeLoan({ ...shared, annualRate: rate });
    return { ...result, rate, totalCost: result.totalPayment + fee };
  };

  const { eligible, ineligibleReason, collateralNote } = assessCollateral(
    lender,
    input.principal,
    collateral
  );

  const best = price(lender.rate_min, processingFeeMin);

  return {
    lender,
    lenderId: lender.id,
    lenderName: lender.lender,
    best,
    worst: price(lender.rate_max, processingFeeMax),
    processingFeeMin,
    processingFeeMax,
    processingFeeBasis: processingFeeBasis(lender),
    tenureUsedYears,
    tenureCapped,
    moratoriumMonths: best.moratoriumMonths,
    eligible,
    ineligibleReason,
    collateralNote,
    daysSinceVerified: daysSinceVerified(lender, input.asOf),
    stale: isStale(lender, input.asOf),
  };
}

/**
 * Compare a loan across lenders, ranked by TOTAL INTEREST over the full loan
 * life at the lender's best-case rate.
 *
 * Total interest is the primary metric because it is the only figure that is
 * fair across both moratorium structures: a lender that makes you service
 * interest monthly shows a lower EMI purely because its principal never grows,
 * even when the loan costs more overall. Sorting on EMI would reward that.
 *
 * Ineligible lenders trail so the UI can still show why they were ruled out.
 */
export function compareLenders(
  input: LenderComparisonInput,
  lenders: Lender[]
): LenderQuote[] {
  return lenders
    .map((lender) => quoteLender(input, lender))
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return a.best.totalInterest - b.best.totalInterest;
    });
}

// ─── Balance transfer ────────────────────────────────────────────────────────

/** Result of balance transfer comparison */
export interface TransferSavingsResult {
  currentLoan: {
    emi: number;
    totalPayment: number;
    totalInterest: number;
  };
  newLoan: {
    bankId: string;
    bankName: string;
    emi: number;
    totalPayment: number;
    totalInterest: number;
    interestRate: number;
  };
  savings: {
    perMonth: number;
    total: number;
    interestReduction: number;
    percentageSavings: number;
  };
}

/**
 * Calculate potential savings from balance transfer.
 * Assumes remaining tenure is being replaced at new bank's rate. A transfer
 * happens after study, so there is no moratorium on either side.
 */
export function calculateTransferSavings(
  outstandingAmount: number,
  currentRate: number,
  newRate: number,
  remainingTenureYears: number,
  bankId: string,
  bankName: string
): TransferSavingsResult {
  const currentLoan = computeLoan({
    principal: outstandingAmount,
    annualRate: currentRate,
    tenureYears: remainingTenureYears,
  });

  const newLoan = computeLoan({
    principal: outstandingAmount,
    annualRate: newRate,
    tenureYears: remainingTenureYears,
  });

  const savingsPerMonth = currentLoan.emi - newLoan.emi;
  const savingsTotal = currentLoan.totalPayment - newLoan.totalPayment;
  const interestReduction = currentLoan.totalInterest - newLoan.totalInterest;
  const percentageSavings = (interestReduction / currentLoan.totalInterest) * 100;

  return {
    currentLoan: {
      emi: currentLoan.emi,
      totalPayment: currentLoan.totalPayment,
      totalInterest: currentLoan.totalInterest,
    },
    newLoan: {
      bankId,
      bankName,
      emi: newLoan.emi,
      totalPayment: newLoan.totalPayment,
      totalInterest: newLoan.totalInterest,
      interestRate: newRate,
    },
    savings: {
      perMonth: savingsPerMonth,
      total: savingsTotal,
      interestReduction,
      percentageSavings,
    },
  };
}
