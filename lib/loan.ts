// Core education-loan math, per the Excel spec (Sheet2 "Core EMI formula").
// EMI = P * r * (1+r)^n / ((1+r)^n - 1), with r = annualRate/12/100 and n = tenureYears*12.

/** Allowed input ranges, from the Excel (Sheet1/Sheet2). */
export const LOAN_LIMITS = {
  amount: { min: 50_000, max: 30_000_000, step: 10_000 }, // ₹50k – ₹3 Cr
  tenureYears: { min: 1, max: 15, step: 1 },
  annualRate: { min: 7, max: 16, step: 0.05 }, // % p.a.
} as const;

export interface LoanInput {
  /** Principal, in ₹. */
  principal: number;
  /** Annual interest rate, as a percentage (e.g. 10 for 10% p.a.). */
  annualRate: number;
  /** Repayment tenure, in years. */
  tenureYears: number;
}

export interface LoanResult {
  principal: number;
  /** Equated monthly instalment, in ₹. */
  emi: number;
  /** EMI × number of months, in ₹. */
  totalPayment: number;
  /** Total payment − principal, in ₹. */
  totalInterest: number;
  /** Tenure expressed in months. */
  months: number;
}

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Compute EMI, total payment, and total interest for a loan.
 * Inputs are clamped to LOAN_LIMITS so downstream UI never renders garbage.
 * Handles the zero-interest edge case (EMI = principal / months).
 */
export function computeLoan(input: LoanInput): LoanResult {
  const principal = clamp(input.principal, LOAN_LIMITS.amount.min, LOAN_LIMITS.amount.max);
  const annualRate = clamp(input.annualRate, LOAN_LIMITS.annualRate.min, LOAN_LIMITS.annualRate.max);
  const tenureYears = clamp(input.tenureYears, LOAN_LIMITS.tenureYears.min, LOAN_LIMITS.tenureYears.max);

  const months = Math.round(tenureYears * 12);
  const r = annualRate / 12 / 100;

  let emi: number;
  if (r === 0) {
    emi = principal / months;
  } else {
    const growth = Math.pow(1 + r, months);
    emi = (principal * r * growth) / (growth - 1);
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return { principal, emi, totalPayment, totalInterest, months };
}

/** Result of comparing a single bank's loan offer */
export interface BankLoanComparison extends LoanResult {
  bankId: string;
  bankName: string;
  interestRate: number;
}

/**
 * Compare loan across multiple banks.
 * Returns sorted array (lowest EMI first).
 */
export function compareLoanAcrossBanks(
  principal: number,
  tenureYears: number,
  banks: Array<{ id: string; name: string; educationRates: { typical: number } }>
): BankLoanComparison[] {
  const results = banks.map((bank) =>
    ({
      ...computeLoan({ principal, annualRate: bank.educationRates.typical, tenureYears }),
      bankId: bank.id,
      bankName: bank.name,
      interestRate: bank.educationRates.typical,
    } as BankLoanComparison)
  );

  // Sort by EMI (lowest first)
  return results.sort((a, b) => a.emi - b.emi);
}

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
 * Assumes remaining tenure is being replaced at new bank's rate.
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
