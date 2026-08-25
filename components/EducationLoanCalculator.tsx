'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import InputControl from './InputControl';
import SegmentedToggle from './SegmentedToggle';
import { LenderComparisonTable } from './LenderComparisonTable';
import { LenderComparisonCards } from './LenderComparisonCards';
import { LenderComparisonChart } from './LenderComparisonChart';
import {
  DATA_PROVENANCE,
  HAS_UNCONFIRMED_FIELDS,
  LENDERS,
  STALE_AFTER_DAYS,
} from '@/lib/lenders';
import {
  compareLenders,
  CollateralStatus,
  LOAN_LIMITS,
  PARTIAL_UNPAID_INTEREST_CAPITALISES,
} from '@/lib/loan';
import { formatINR, formatINRCompact, formatMonths, formatRateBand } from '@/lib/format';

type ComparisonView = 'table' | 'cards' | 'chart';

const COLLATERAL_OPTIONS = [
  {
    value: 'secured' as const,
    label: 'Secured',
    caption: 'Backed by property, FD or other collateral. Every lender will quote.',
  },
  {
    value: 'unsecured' as const,
    label: 'Unsecured',
    caption: 'No collateral. Lenders with a hard threshold drop out above it.',
  },
];

export function EducationLoanCalculator() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState(1_000_000); // ₹10 lakhs default
  const [courseDurationMonths, setCourseDurationMonths] = useState(24); // 2-year masters
  const [tenureYears, setTenureYears] = useState(10);
  const [collateral, setCollateral] = useState<CollateralStatus>('secured');
  const [view, setView] = useState<ComparisonView>('table');

  const quotes = useMemo(
    () =>
      compareLenders(
        { principal: loanAmount, tenureYears, courseDurationMonths, collateral },
        LENDERS
      ),
    [loanAmount, tenureYears, courseDurationMonths, collateral]
  );

  const eligible = quotes.filter((q) => q.eligible);
  const best = eligible[0];
  const ineligibleCount = quotes.length - eligible.length;

  // Grace periods differ by lender, so the moratorium is a range, not a number.
  const moratoriumMonths = eligible.map((q) => q.moratoriumMonths);
  const moratoriumMin = moratoriumMonths.length ? Math.min(...moratoriumMonths) : 0;
  const moratoriumMax = moratoriumMonths.length ? Math.max(...moratoriumMonths) : 0;

  // Cheapest and dearest realistic outcomes across every eligible lender.
  const emiFloor = eligible.length ? Math.min(...eligible.map((q) => q.best.emi)) : 0;
  const emiCeiling = eligible.length ? Math.max(...eligible.map((q) => q.worst.emi)) : 0;
  const cappedCount = eligible.filter((q) => q.tenureCapped).length;

  // The lowest-EMI lender is often NOT the cheapest loan. Surfacing the gap is
  // the whole point of ranking on total interest.
  const cheapestEmi = eligible.length
    ? eligible.reduce((a, b) => (a.best.emi <= b.best.emi ? a : b))
    : undefined;
  const staleCount = quotes.filter((q) => q.stale).length;

  // Partial-servicing lenders are modelled per spec: the unserviced share of
  // interest does not accrue. That materially favours them, so say so.
  const partialLenders = eligible.filter(
    (q) => q.lender.moratorium_type === 'partial_interest_serviced'
  );

  return (
    <div className="space-y-8 py-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl">
          Education Loan Calculator
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Compare published rate bands across {LENDERS.length} lenders and see what your EMI could
          actually cost.
        </p>
      </div>

      {HAS_UNCONFIRMED_FIELDS && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">
            Rates and fees are confirmed — moratorium terms are not
          </p>
          <p className="mt-1">
            Confirmed from the rate table supplied {DATA_PROVENANCE.ratesSuppliedOn}:{' '}
            {DATA_PROVENANCE.confirmed.join(', ')}. Still placeholder:{' '}
            <strong>{DATA_PROVENANCE.unconfirmed.join(', ')}</strong>.
          </p>
          <p className="mt-1">
            The moratorium fields decide the effective principal each EMI is built on, so every
            EMI and total-interest figure below is provisional until they are sourced. The rate
            bands, fees and collateral rules are not.
          </p>
        </div>
      )}

      {/* Inputs */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-x-8 gap-y-8 md:grid-cols-2">
          <InputControl
            label="Loan amount"
            value={loanAmount}
            onChange={setLoanAmount}
            min={LOAN_LIMITS.amount.min}
            max={LOAN_LIMITS.amount.max}
            step={LOAN_LIMITS.amount.step}
            format={formatINRCompact}
            hint="Drag the slider or type the exact amount."
            prefix="₹"
          />

          <InputControl
            label="Course duration"
            value={courseDurationMonths}
            onChange={setCourseDurationMonths}
            min={LOAN_LIMITS.courseDurationMonths.min}
            max={LOAN_LIMITS.courseDurationMonths.max}
            step={LOAN_LIMITS.courseDurationMonths.step}
            format={formatMonths}
            hint="Sets the moratorium. Each lender adds its own grace period on top (6–12 months)."
            suffix="months"
          />

          <InputControl
            label="Repayment tenure"
            value={tenureYears}
            onChange={setTenureYears}
            min={LOAN_LIMITS.tenureYears.min}
            max={LOAN_LIMITS.tenureYears.max}
            step={LOAN_LIMITS.tenureYears.step}
            format={(val) => `${val} yr`}
            hint="Post-moratorium repayment period only — not total loan life. Lenders that cap lower are capped individually."
            suffix="years"
          />

          <SegmentedToggle
            label="Collateral status"
            hint="Drives which lenders will write the loan at all."
            value={collateral}
            options={COLLATERAL_OPTIONS}
            onChange={setCollateral}
          />
        </div>

        {/* Timeline derived from the inputs above */}
        <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Moratorium
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {moratoriumMin === moratoriumMax
                ? `${moratoriumMin} months`
                : `${moratoriumMin}–${moratoriumMax} months`}
            </p>
            <p className="text-xs text-slate-500">
              {courseDurationMonths} course + 6–12 grace, by lender
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Repayment
            </p>
            <p className="mt-1 font-semibold text-slate-900">{tenureYears * 12} months</p>
            <p className="text-xs text-slate-500">
              {cappedCount > 0
                ? `${cappedCount} lender${cappedCount === 1 ? '' : 's'} cap${cappedCount === 1 ? 's' : ''} lower`
                : `${tenureYears} years of EMIs`}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total loan life
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {moratoriumMin === moratoriumMax
                ? `${moratoriumMin + tenureYears * 12} months`
                : `${moratoriumMin + tenureYears * 12}–${moratoriumMax + tenureYears * 12} months`}
            </p>
            <p className="text-xs text-slate-500">Moratorium plus repayment</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              EMI across all lenders
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {eligible.length ? `${formatINR(emiFloor)} – ${formatINR(emiCeiling)}` : '—'}
            </p>
            <p className="text-xs text-slate-500">
              {eligible.length ? `${eligible.length} lenders quoting` : 'No lender quoting'}
            </p>
          </div>
        </div>
      </div>

      {collateral === 'unsecured' && ineligibleCount > 0 && best && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">
            {ineligibleCount} of {quotes.length} lenders need collateral for {formatINR(loanAmount)}
          </p>
          <p className="mt-1">
            They are marked unavailable below. The rest will still quote, though several treat
            unsecured lending as a case-by-case call rather than a published rule.
          </p>
        </div>
      )}

      {/* Headline */}
      {best ? (
        <div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase text-orange-700">Cheapest overall</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">{best.lenderName}</p>
              <p className="text-sm text-orange-700">
                {formatRateBand(best.lender.rate_min, best.lender.rate_max)} ·{' '}
                {best.lender.rate_type}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-orange-700">
                Total interest · full loan life
              </p>
              <p className="mt-1 text-2xl font-bold text-orange-600">
                {formatINR(best.best.totalInterest)}
              </p>
              <p className="text-sm text-orange-700">
                up to {formatINR(best.worst.totalInterest)} at their top rate
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-orange-700">
                Payment during moratorium
              </p>
              <p className="mt-1 text-2xl font-bold text-orange-600">
                {best.best.moratoriumMonthlyPayment > 0
                  ? `${formatINR(best.best.moratoriumMonthlyPayment)}/mo`
                  : '₹0'}
              </p>
              <p className="text-sm text-orange-700">
                for {best.moratoriumMonths} months
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-orange-700">
                EMI after moratorium
              </p>
              <p className="mt-1 text-2xl font-bold text-orange-600">
                from {formatINR(best.best.emi)}
              </p>
              <p className="text-sm text-orange-700">
                on {formatINR(best.best.principalAtRepaymentStart)} effective principal
              </p>
            </div>
          </div>

          {cheapestEmi && cheapestEmi.lenderId !== best.lenderId && (
            <p className="mt-4 border-t border-orange-200 pt-3 text-sm text-orange-900">
              <strong>{cheapestEmi.lenderName}</strong> has the lowest monthly EMI (
              {formatINR(cheapestEmi.best.emi)} vs {formatINR(best.best.emi)}), but costs{' '}
              {formatINR(cheapestEmi.best.totalInterest - best.best.totalInterest)} more in
              interest over the life of the loan. Headline rate and EMI both mislead here —
              compare on total interest.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-900">
          <p className="font-semibold">No lender matches these inputs</p>
          <p className="mt-1">
            No lender in the list writes an unsecured loan of {formatINR(loanAmount)}. Switch
            collateral status to <strong>Secured</strong>, or lower the loan amount.
          </p>
        </div>
      )}

      {/* View tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {(['table', 'cards', 'chart'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium capitalize transition-colors ${
              view === v
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {v === 'table' && 'Comparison Table'}
            {v === 'cards' && 'Lender Cards'}
            {v === 'chart' && 'Visual Chart'}
          </button>
        ))}
      </div>

      <div>
        {view === 'table' && (
          <LenderComparisonTable quotes={quotes} bestLenderId={best?.lenderId ?? ''} />
        )}
        {view === 'cards' && (
          <LenderComparisonCards quotes={quotes} bestLenderId={best?.lenderId ?? ''} />
        )}
        {view === 'chart' && (
          <LenderComparisonChart quotes={eligible} bestLenderId={best?.lenderId ?? ''} />
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="mb-1 font-semibold">How to read these numbers</p>
        <p>
          Lenders price within a band, not at a point. Where you land depends on credit score,
          co-applicant income, collateral value and institute tier — so the &ldquo;from&rdquo;
          figure is a best case, not a quote. Interest during the moratorium is modelled per
          lender: some capitalise it in full, some require you to service all of it monthly, some
          a fixed share.
        </p>
        {!PARTIAL_UNPAID_INTEREST_CAPITALISES && partialLenders.length > 0 && (
          <p className="mt-2">
            <strong>
              {partialLenders.length} lender{partialLenders.length === 1 ? '' : 's'} here
              require{partialLenders.length === 1 ? 's' : ''} only partial interest servicing
            </strong>{' '}
            ({partialLenders.map((q) => q.lenderName).join(', ')}). Their figures assume the
            unserviced share of interest never accrues, so their effective principal stays at the
            disbursed amount. If those lenders in fact capitalise the unpaid share, their total
            interest is understated here and the ranking above can change.
          </p>
        )}
        <p className="mt-2">
          Rates shown are {staleCount > 0 ? 'partly stale — ' : ''}
          last verified per lender (see the Verified column); anything older than {STALE_AFTER_DAYS}{' '}
          days is flagged. Floating rates move with the lender&rsquo;s benchmark and will change
          over the life of the loan. These estimates do not constitute a loan offer. Confirm terms
          directly with the lender.
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 p-8 text-center text-white">
        <h2 className="mb-2 text-2xl font-bold">Ready to Apply?</h2>
        <p className="mb-4 text-orange-100">
          Connect with our experts to guide you through the application process.
        </p>
        <button
          onClick={() => router.push('/balance-transfer')}
          className="inline-block rounded-md bg-white px-8 py-3 font-semibold text-orange-600 transition-colors hover:bg-orange-50"
        >
          Talk to a Loan Expert →
        </button>
      </div>
    </div>
  );
}
