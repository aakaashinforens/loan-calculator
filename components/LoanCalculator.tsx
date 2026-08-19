"use client";

import { useMemo, useState } from "react";
import { computeLoan, LOAN_LIMITS } from "@/lib/loan";
import { formatINR, formatINRCompact } from "@/lib/format";
import InputControl from "./InputControl";
import ResultCard from "./ResultCard";
import BreakdownChart from "./BreakdownChart";

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState(1_000_000);
  const [annualRate, setAnnualRate] = useState(10);
  const [tenureYears, setTenureYears] = useState(10);

  const result = useMemo(
    () => computeLoan({ principal, annualRate, tenureYears }),
    [principal, annualRate, tenureYears]
  );

  const interestPct = result.totalPayment
    ? Math.round((result.totalInterest / result.totalPayment) * 100)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Inputs */}
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-xl font-bold text-ink">Loan details</h2>
        <p className="mt-1 text-sm text-muted">
          Adjust the values to see your monthly EMI update instantly.
        </p>

        <div className="mt-8 space-y-8">
          <InputControl
            label="Loan amount"
            value={principal}
            min={LOAN_LIMITS.amount.min}
            max={LOAN_LIMITS.amount.max}
            step={LOAN_LIMITS.amount.step}
            onChange={setPrincipal}
            format={formatINRCompact}
            suffix="₹"
          />
          <InputControl
            label="Interest rate (p.a.)"
            value={annualRate}
            min={LOAN_LIMITS.annualRate.min}
            max={LOAN_LIMITS.annualRate.max}
            step={LOAN_LIMITS.annualRate.step}
            onChange={setAnnualRate}
            format={(v) => `${v}%`}
            suffix="%"
          />
          <InputControl
            label="Loan tenure"
            value={tenureYears}
            min={LOAN_LIMITS.tenureYears.min}
            max={LOAN_LIMITS.tenureYears.max}
            step={LOAN_LIMITS.tenureYears.step}
            onChange={setTenureYears}
            format={(v) => `${v} yr`}
            suffix="yrs"
          />
        </div>
      </section>

      {/* Results */}
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-xl font-bold text-ink">Your repayment</h2>
        <p className="mt-1 text-sm text-muted">
          Over {result.months} months ({tenureYears} {tenureYears === 1 ? "year" : "years"}).
        </p>

        <div className="mt-6">
          <BreakdownChart
            principal={result.principal}
            interest={result.totalInterest}
            centerLabel={formatINR(result.emi)}
            centerCaption={`${interestPct}% is interest`}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-primary" />
            Principal
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: "oklch(0.82 0.09 44.04)" }}
            />
            Interest
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ResultCard label="Monthly EMI" value={formatINR(result.emi)} emphasis />
          <ResultCard label="Total interest" value={formatINR(result.totalInterest)} />
          <ResultCard label="Total payment" value={formatINR(result.totalPayment)} />
        </div>

        <a href="https://www.inforens.com" className="btn-primary mt-6 w-full">
          Talk to a loan expert
        </a>
      </section>
    </div>
  );
}
