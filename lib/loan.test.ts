import { describe, expect, it } from "vitest";
import {
  compareLenders,
  computeLoan,
  GRACE_PERIOD_MONTHS,
  LOAN_LIMITS,
  quoteLender,
  servicedFraction,
} from "./loan";
import {
  daysSinceVerified,
  isStale,
  Lender,
  LENDERS,
  processingFeeBasis,
  processingFeeFor,
} from "./lenders";

describe("computeLoan", () => {
  it("matches the known EMI for ₹10L at 10% over 10 years", () => {
    const { emi, totalPayment, totalInterest, months } = computeLoan({
      principal: 1_000_000,
      annualRate: 10,
      tenureYears: 10,
    });
    expect(months).toBe(120);
    expect(Math.round(emi)).toBe(13215);
    expect(totalPayment).toBeCloseTo(1_585_774, -2);
    expect(totalInterest).toBeCloseTo(585_774, -2);
  });

  it("handles the zero-interest edge case (clamped to min rate, so force r=0 via floor)", () => {
    const res = computeLoan({ principal: 1_200_000, annualRate: 7, tenureYears: 1 });
    expect(res.months).toBe(12);
    expect(res.emi).toBeGreaterThan(res.principal / res.months);
  });

  it("clamps out-of-range inputs to the allowed limits", () => {
    const res = computeLoan({ principal: 1, annualRate: 99, tenureYears: 100 });
    expect(res.principal).toBe(LOAN_LIMITS.amount.min);
    expect(Number.isFinite(res.emi)).toBe(true);
    expect(res.emi).toBeGreaterThan(0);
  });

  it("keeps totalPayment = emi * months and totalInterest = totalPayment - principal", () => {
    const res = computeLoan({ principal: 2_500_000, annualRate: 12.5, tenureYears: 8 });
    expect(res.totalPayment).toBeCloseTo(res.emi * res.months, 6);
    expect(res.totalInterest).toBeCloseTo(res.totalPayment - res.principal, 6);
  });
});

describe("servicedFraction", () => {
  it("maps each moratorium type to the share of interest actually paid", () => {
    expect(servicedFraction("full_capitalized", null)).toBe(0);
    expect(servicedFraction("simple_interest_serviced", null)).toBe(1);
    expect(servicedFraction("partial_interest_serviced", 50)).toBe(0.5);
    expect(servicedFraction("partial_interest_serviced", 100)).toBe(1);
  });

  it("treats a missing or out-of-range partial percentage safely", () => {
    expect(servicedFraction("partial_interest_serviced", null)).toBe(0);
    expect(servicedFraction("partial_interest_serviced", 150)).toBe(1);
    expect(servicedFraction("partial_interest_serviced", -20)).toBe(0);
  });
});

describe("moratorium", () => {
  const base = { principal: 1_000_000, annualRate: 10, tenureYears: 10 };

  it("is a no-op when there is no course duration (back-compat)", () => {
    const res = computeLoan(base);
    expect(res.moratoriumMonths).toBe(0);
    expect(res.moratoriumInterest).toBe(0);
    expect(res.principalAtRepaymentStart).toBe(res.principal);
    expect(Math.round(res.emi)).toBe(13215);
  });

  it("defaults the grace period once a course duration is given", () => {
    const res = computeLoan({ ...base, courseDurationMonths: 24 });
    expect(res.moratoriumMonths).toBe(24 + GRACE_PERIOD_MONTHS);
    expect(res.totalDurationMonths).toBe(30 + 120);
  });

  it("full_capitalized compounds interest into the principal the EMI is built on", () => {
    const res = computeLoan({
      ...base,
      courseDurationMonths: 24,
      moratoriumType: "full_capitalized",
    });
    const expected = 1_000_000 * Math.pow(1 + 10 / 12 / 100, 30);
    expect(res.principalAtRepaymentStart).toBeCloseTo(expected, 2);
    expect(res.moratoriumInterest).toBeCloseTo(expected - 1_000_000, 2);
    expect(res.moratoriumPayment).toBe(0);
    expect(res.emi).toBeGreaterThan(computeLoan(base).emi);
  });

  it("simple_interest_serviced leaves the principal alone and charges simple interest", () => {
    const res = computeLoan({
      ...base,
      courseDurationMonths: 24,
      moratoriumType: "simple_interest_serviced",
    });
    expect(res.principalAtRepaymentStart).toBeCloseTo(1_000_000, 6);
    expect(res.moratoriumMonthlyPayment).toBeCloseTo(1_000_000 * (10 / 12 / 100), 6);
    expect(res.moratoriumPayment).toBeCloseTo(1_000_000 * (10 / 12 / 100) * 30, 6);
    expect(Math.round(res.emi)).toBe(13215); // same EMI as a plain term loan
  });

  it("partial_interest_serviced leaves the principal unchanged, per spec", () => {
    const shared = { ...base, courseDurationMonths: 24 };
    const capitalised = computeLoan({ ...shared, moratoriumType: "full_capitalized" });
    const serviced = computeLoan({ ...shared, moratoriumType: "simple_interest_serviced" });
    const partial = computeLoan({
      ...shared,
      moratoriumType: "partial_interest_serviced",
      partialInterestPct: 50,
    });

    // Spec: effective_principal = disbursed_principal for any serviced moratorium.
    expect(partial.principalAtRepaymentStart).toBeCloseTo(1_000_000, 6);
    expect(partial.emi).toBeCloseTo(serviced.emi, 6);
    // Half the monthly interest, so half the out-of-pocket during study.
    expect(partial.moratoriumMonthlyPayment).toBeCloseTo(
      serviced.moratoriumMonthlyPayment / 2,
      6
    );
    expect(partial.totalInterest).toBeLessThan(serviced.totalInterest);
    expect(partial.totalInterest).toBeLessThan(capitalised.totalInterest);
  });

  it("partial at 100% is identical to servicing the full interest", () => {
    const shared = { ...base, courseDurationMonths: 18 };
    const full = computeLoan({ ...shared, moratoriumType: "simple_interest_serviced" });
    const partial = computeLoan({
      ...shared,
      moratoriumType: "partial_interest_serviced",
      partialInterestPct: 100,
    });
    expect(partial.emi).toBeCloseTo(full.emi, 6);
    expect(partial.moratoriumPayment).toBeCloseTo(full.moratoriumPayment, 6);
  });

  it("partial at 0% is identical to full capitalisation", () => {
    const shared = { ...base, courseDurationMonths: 18 };
    const capitalised = computeLoan({ ...shared, moratoriumType: "full_capitalized" });
    const partial = computeLoan({
      ...shared,
      moratoriumType: "partial_interest_serviced",
      partialInterestPct: 0,
    });
    expect(partial.emi).toBeCloseTo(capitalised.emi, 6);
    expect(partial.moratoriumPayment).toBe(0);
  });

  it("keeps totalInterest = totalPayment - principal with a moratorium", () => {
    const res = computeLoan({ ...base, courseDurationMonths: 36 });
    expect(res.totalPayment).toBeCloseTo(res.emi * res.months + res.moratoriumPayment, 6);
    expect(res.totalInterest).toBeCloseTo(res.totalPayment - res.principal, 6);
  });
});

// ─── Lender fixtures ─────────────────────────────────────────────────────────

const psu: Lender = {
  id: "psu",
  lender: "PSU Bank",
  category: "PSU",
  rate_min: 8.0,
  rate_max: 10.0,
  collateral_required: "above_threshold",
  collateral_threshold_inr: 750_000,
  processing_fee_pct: 0.5,
  processing_fee_pct_max: null,
  processing_fee_flat_inr: null,
  processing_fee_cap_inr: 10_000,
  moratorium_type: "full_capitalized",
  moratorium_grace_months: 6,
  partial_interest_pct: null,
  max_repayment_tenure_years: 15,
  rate_type: "floating",
  last_verified: "2026-08-01",
  accepts_balance_transfer: true,
  balance_transfer_rate_typical: 8.0,
  eligibility_notes: [],
};

const nbfc: Lender = {
  ...psu,
  id: "nbfc",
  lender: "NBFC",
  category: "NBFC",
  rate_min: 11.0,
  rate_max: 14.0,
  collateral_required: "none",
  collateral_threshold_inr: null,
  processing_fee_pct: 1.5,
  processing_fee_cap_inr: null,
  moratorium_type: "partial_interest_serviced",
  moratorium_grace_months: 12,
  partial_interest_pct: 50,
  max_repayment_tenure_years: 10,
  rate_type: "fixed",
};

const caseByCase: Lender = {
  ...psu,
  id: "private",
  lender: "Private Bank",
  category: "Private",
  rate_min: 9.5,
  rate_max: 12.5,
  collateral_required: "case_by_case",
  collateral_threshold_inr: null,
  processing_fee_pct: null,
  processing_fee_flat_inr: 15_000,
  processing_fee_cap_inr: null,
  moratorium_type: "simple_interest_serviced",
  partial_interest_pct: null,
};

describe("processing fees", () => {
  it("applies a percentage and honours the cap", () => {
    expect(processingFeeFor(psu, 1_000_000)).toBe(5_000); // 0.5%, under the cap
    expect(processingFeeFor(psu, 5_000_000)).toBe(10_000); // 0.5% = 25k, capped
    expect(processingFeeBasis(psu)).toBe("0.50% (max ₹10,000)");
  });

  it("applies a flat fee regardless of loan size", () => {
    expect(processingFeeFor(caseByCase, 500_000)).toBe(15_000);
    expect(processingFeeFor(caseByCase, 5_000_000)).toBe(15_000);
    expect(processingFeeBasis(caseByCase)).toBe("₹15,000 flat");
  });

  it("leaves an uncapped percentage uncapped", () => {
    expect(processingFeeFor(nbfc, 2_000_000)).toBe(30_000);
    expect(processingFeeBasis(nbfc)).toBe("1.50%");
  });
});

describe("verification staleness", () => {
  const asOf = new Date("2026-08-25T00:00:00Z");

  it("counts whole days since last_verified", () => {
    expect(daysSinceVerified(psu, asOf)).toBe(24);
    expect(isStale(psu, asOf)).toBe(false);
  });

  it("flags a rate card older than the staleness window", () => {
    const old = { ...psu, last_verified: "2026-01-01" };
    expect(daysSinceVerified(old, asOf)).toBe(236);
    expect(isStale(old, asOf)).toBe(true);
  });

  it("treats an unparseable date as maximally stale", () => {
    const broken = { ...psu, last_verified: "not-a-date" };
    expect(isStale(broken, asOf)).toBe(true);
  });
});

describe("quoteLender", () => {
  const input = { principal: 1_000_000, tenureYears: 12, courseDurationMonths: 24 };

  it("prices both ends of the published band", () => {
    const q = quoteLender(input, psu);
    expect(q.best.rate).toBe(8.0);
    expect(q.worst.rate).toBe(10.0);
    expect(q.best.emi).toBeLessThan(q.worst.emi);
    expect(q.best.totalInterest).toBeLessThan(q.worst.totalInterest);
  });

  it("uses the lender's own grace period, not the global default", () => {
    expect(quoteLender(input, psu).moratoriumMonths).toBe(24 + 6);
    expect(quoteLender(input, nbfc).moratoriumMonths).toBe(24 + 12);
  });

  it("caps the repayment tenure at the lender's ceiling and says so", () => {
    const capped = quoteLender({ ...input, tenureYears: 12 }, nbfc);
    expect(capped.tenureUsedYears).toBe(10);
    expect(capped.tenureCapped).toBe(true);
    expect(capped.best.months).toBe(120);

    const uncapped = quoteLender({ ...input, tenureYears: 12 }, psu);
    expect(uncapped.tenureUsedYears).toBe(12);
    expect(uncapped.tenureCapped).toBe(false);
  });

  it("adds the processing fee into totalCost but not totalInterest", () => {
    const q = quoteLender(input, psu);
    expect(q.processingFeeMin).toBe(5_000);
    expect(q.best.totalCost).toBeCloseTo(q.best.totalPayment + 5_000, 6);
    expect(q.best.totalInterest).toBeCloseTo(q.best.totalPayment - q.best.principal, 6);
  });

  it("applies the lender's moratorium type", () => {
    expect(quoteLender(input, psu).best.moratoriumPayment).toBe(0); // capitalised
    expect(quoteLender(input, caseByCase).best.moratoriumPayment).toBeGreaterThan(0); // serviced
  });
});

describe("collateral eligibility", () => {
  const input = { principal: 1_000_000, tenureYears: 10, courseDurationMonths: 24 };

  it("keeps every lender eligible when collateral is offered", () => {
    const quotes = compareLenders({ ...input, collateral: "secured" }, [psu, nbfc, caseByCase]);
    expect(quotes.every((q) => q.eligible)).toBe(true);
    expect(quotes.every((q) => q.collateralNote === "")).toBe(true);
  });

  it("rules out an above_threshold lender past its threshold", () => {
    const quotes = compareLenders({ ...input, collateral: "unsecured" }, [psu, nbfc, caseByCase]);
    const psuQuote = quotes.find((q) => q.lenderId === "psu")!;
    expect(psuQuote.eligible).toBe(false);
    expect(psuQuote.ineligibleReason).toContain("₹7.5L");
  });

  it("keeps an above_threshold lender under its threshold", () => {
    const quotes = compareLenders(
      { ...input, principal: 700_000, collateral: "unsecured" },
      [psu]
    );
    expect(quotes[0].eligible).toBe(true);
  });

  it("keeps case_by_case and none lenders eligible, with distinct notes", () => {
    const quotes = compareLenders({ ...input, collateral: "unsecured" }, [nbfc, caseByCase]);
    const none = quotes.find((q) => q.lenderId === "nbfc")!;
    const cbc = quotes.find((q) => q.lenderId === "private")!;
    expect(none.eligible).toBe(true);
    expect(none.collateralNote).toBe("Lends unsecured");
    expect(cbc.eligible).toBe(true);
    expect(cbc.collateralNote).toContain("Case by case");
  });
});

describe("compareLenders", () => {
  const input = { principal: 1_000_000, tenureYears: 10, courseDurationMonths: 24 };

  it("ranks eligible lenders by total interest over the full loan life", () => {
    const quotes = compareLenders(input, [nbfc, caseByCase, psu]);
    for (let i = 1; i < quotes.length; i += 1) {
      expect(quotes[i].best.totalInterest).toBeGreaterThanOrEqual(
        quotes[i - 1].best.totalInterest
      );
    }
  });

  it("does not rank on EMI — a serviced moratorium buys a low EMI, not a cheap loan", () => {
    // caseByCase services interest monthly, so its principal never grows and its
    // EMI is the lowest. psu capitalises, so its EMI is higher — but it is the
    // cheaper loan overall once the serviced payments are counted.
    const quotes = compareLenders(input, [psu, caseByCase]);
    const psuQuote = quotes.find((q) => q.lenderId === "psu")!;
    const cbcQuote = quotes.find((q) => q.lenderId === "private")!;

    expect(cbcQuote.best.emi).toBeLessThan(psuQuote.best.emi);
    expect(psuQuote.best.totalInterest).toBeLessThan(cbcQuote.best.totalInterest);
    expect(quotes[0].lenderId).toBe("psu"); // ranked on total interest, so psu wins
  });

  it("pushes ineligible lenders to the bottom regardless of price", () => {
    const quotes = compareLenders({ ...input, collateral: "unsecured" }, [psu, nbfc, caseByCase]);
    expect(quotes[quotes.length - 1].lenderId).toBe("psu"); // cheapest, but ineligible
    expect(quotes[quotes.length - 1].eligible).toBe(false);
    expect(quotes.slice(0, -1).every((q) => q.eligible)).toBe(true);
  });
});

// ─── Section 3 worked example ────────────────────────────────────────────────
//
// ₹10L principal, 2-year course + 6-month grace = 30-month moratorium,
// 10-year/120-month repayment. Figures taken from the agreed spec.

describe("Section 3 worked example", () => {
  const shared = {
    principal: 1_000_000,
    tenureYears: 10,
    courseDurationMonths: 24,
    gracePeriodMonths: 6,
  };

  const sbi = computeLoan({ ...shared, annualRate: 9.0, moratoriumType: "full_capitalized" });
  const axis = computeLoan({
    ...shared,
    annualRate: 10.5,
    moratoriumType: "simple_interest_serviced",
  });

  it("SBI (PSU, 9.00%, full moratorium) matches the spec figures", () => {
    expect(sbi.moratoriumMonths).toBe(30);
    expect(sbi.moratoriumMonthlyPayment).toBe(0); // ₹0 during moratorium
    expect(Math.round(sbi.moratoriumInterest)).toBe(251_272); // spec: ₹2,51,280
    expect(Math.round(sbi.principalAtRepaymentStart)).toBe(1_251_272); // spec: ₹12,51,280
    expect(Math.round(sbi.emi)).toBe(15_851); // spec: ₹15,850
    expect(Math.round(sbi.totalInterest)).toBe(902_070); // spec: ₹9,02,000
  });

  it("Axis (Private, 10.50%, interest-serviced) matches the spec figures", () => {
    expect(Math.round(axis.moratoriumMonthlyPayment)).toBe(8_750); // spec: ₹8,750/month
    expect(Math.round(axis.moratoriumPayment)).toBe(262_500); // spec: ₹2,62,500
    expect(axis.principalAtRepaymentStart).toBe(1_000_000); // unchanged
    expect(Math.round(axis.emi)).toBe(13_493); // spec: ₹13,494
    expect(Math.round(axis.emi * axis.months - axis.principal)).toBe(619_220); // spec: ₹6,19,280
    expect(Math.round(axis.totalInterest)).toBe(881_720); // spec: ₹8,81,780
  });

  it("reproduces the non-obvious result: the lower headline rate is NOT cheaper", () => {
    // 9.00% vs 10.50% — yet Axis costs less overall once capitalisation is counted.
    expect(axis.totalInterest).toBeLessThan(sbi.totalInterest);
    // ...while SBI's EMI is the higher of the two, so EMI alone inverts the answer.
    expect(sbi.emi).toBeGreaterThan(axis.emi);
  });
});

describe("processing fee ranges", () => {
  const ranged: Lender = {
    ...psu,
    id: "ranged",
    processing_fee_pct: 1.0,
    processing_fee_pct_max: 1.5,
    processing_fee_flat_inr: null,
    processing_fee_cap_inr: null,
  };

  it("prices both ends of a quoted fee range", () => {
    expect(processingFeeFor(ranged, 1_000_000, "min")).toBe(10_000);
    expect(processingFeeFor(ranged, 1_000_000, "max")).toBe(15_000);
    expect(processingFeeBasis(ranged)).toBe("1.00–1.50%");
  });

  it("pairs the cheap fee with the cheap rate and the dear fee with the dear rate", () => {
    const q = quoteLender({ principal: 1_000_000, tenureYears: 10 }, ranged);
    expect(q.processingFeeMin).toBe(10_000);
    expect(q.processingFeeMax).toBe(15_000);
    expect(q.best.totalCost).toBeCloseTo(q.best.totalPayment + 10_000, 6);
    expect(q.worst.totalCost).toBeCloseTo(q.worst.totalPayment + 15_000, 6);
  });

  it("collapses to a single value when no max is quoted", () => {
    const flatPct: Lender = { ...ranged, processing_fee_pct_max: null };
    expect(processingFeeFor(flatPct, 1_000_000, "min")).toBe(10_000);
    expect(processingFeeFor(flatPct, 1_000_000, "max")).toBe(10_000);
    expect(processingFeeBasis(flatPct)).toBe("1.00%");
  });

  it("applies the cap to both ends of a range", () => {
    const capped: Lender = { ...ranged, processing_fee_cap_inr: 12_000 };
    expect(processingFeeFor(capped, 1_000_000, "min")).toBe(10_000);
    expect(processingFeeFor(capped, 1_000_000, "max")).toBe(12_000); // 15k capped
  });
});

describe("supplied rate table", () => {
  it("carries the client's rate bands verbatim", () => {
    const expected: Record<string, [number, number]> = {
      bob: [8.85, 9.85],
      pnb: [8.9, 9.9],
      sbi: [9.0, 10.0],
      canara: [9.1, 10.1],
      axis: [10.5, 11.5],
      icici: [10.75, 11.75],
      idfc: [11.0, 12.0],
      credila: [10.9, 12.5],
      avanse: [11.0, 12.75],
      auxilo: [11.15, 12.9],
      "tata-capital": [11.35, 13.0],
      poonawalla: [11.5, 13.25],
    };
    expect(LENDERS).toHaveLength(Object.keys(expected).length);
    for (const lender of LENDERS) {
      const [min, max] = expected[lender.id];
      expect([lender.id, lender.rate_min, lender.rate_max]).toEqual([lender.id, min, max]);
    }
  });

  it("applies the fee and collateral structure by category", () => {
    for (const l of LENDERS) {
      if (l.category === "PSU") {
        expect(l.processing_fee_pct).toBe(0.5);
        expect(l.processing_fee_pct_max).toBeNull();
        expect(l.processing_fee_cap_inr).toBe(10_000);
        expect(l.collateral_required).toBe("above_threshold");
        expect(l.collateral_threshold_inr).toBe(750_000);
      } else {
        expect(l.collateral_required).toBe("case_by_case");
        expect(l.processing_fee_pct).toBe(1.0);
        expect(l.processing_fee_cap_inr).toBeNull();
        // NBFCs quote 1.00–1.50%; private banks a flat 1.00%.
        expect(l.processing_fee_pct_max).toBe(l.category === "NBFC" ? 1.5 : null);
      }
    }
  });

  it("reproduces the supplied day-one EMIs when the moratorium is removed", () => {
    // Sanity check that the bands are loaded right: with no course duration the
    // engine must return the figures from the supplied table.
    const sbi = LENDERS.find((l) => l.id === "sbi")!;
    const low = computeLoan({ principal: 1_000_000, annualRate: sbi.rate_min, tenureYears: 10 });
    const high = computeLoan({ principal: 1_000_000, annualRate: sbi.rate_max, tenureYears: 10 });
    expect(Math.round(low.emi)).toBe(12_668); // table: ₹12,668
    expect(Math.round(high.emi)).toBe(13_215); // table: ₹13,215
  });
});
