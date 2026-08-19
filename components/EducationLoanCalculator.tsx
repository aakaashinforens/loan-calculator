'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import InputControl from './InputControl';
import { BankComparisonTable } from './BankComparisonTable';
import { BankComparisonCards } from './BankComparisonCards';
import { BankComparisonChart } from './BankComparisonChart';
import { BANKS } from '@/lib/banks';
import { compareLoanAcrossBanks, LOAN_LIMITS } from '@/lib/loan';

type ComparisonView = 'table' | 'cards' | 'chart';

export function EducationLoanCalculator() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState(1_000_000); // ₹10 lakhs default
  const [tenureYears, setTenureYears] = useState(10); // 10 years default
  const [view, setView] = useState<ComparisonView>('table');

  // Compute comparisons
  const comparisons = useMemo(
    () => compareLoanAcrossBanks(loanAmount, tenureYears, BANKS),
    [loanAmount, tenureYears]
  );

  // Best bank (lowest EMI)
  const bestBank = comparisons[0];
  const mostExpensive = comparisons[comparisons.length - 1];
  const savings = mostExpensive.emi - bestBank.emi;

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl">
          Education Loan Calculator
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Compare interest rates across all major banks and find the best option for you.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <InputControl
            label="Loan Amount (₹)"
            value={loanAmount}
            onChange={setLoanAmount}
            min={LOAN_LIMITS.amount.min}
            max={LOAN_LIMITS.amount.max}
            step={LOAN_LIMITS.amount.step}
            format={(val) => `₹${(val / 100000).toFixed(1)}L`}
            suffix="₹"
          />
          <p className="mt-2 text-xs text-slate-600">
            Min: ₹{(LOAN_LIMITS.amount.min / 100000).toFixed(1)}L | Max: ₹{(LOAN_LIMITS.amount.max / 10000000).toFixed(2)}Cr
          </p>
        </div>

        <div>
          <InputControl
            label="Loan Tenure (Years)"
            value={tenureYears}
            onChange={setTenureYears}
            min={LOAN_LIMITS.tenureYears.min}
            max={LOAN_LIMITS.tenureYears.max}
            step={LOAN_LIMITS.tenureYears.step}
            format={(val) => `${val} years`}
          />
          <p className="mt-2 text-xs text-slate-600">
            {tenureYears * 12} months total
          </p>
        </div>

        {/* Summary Card */}
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4 border border-orange-200">
          <p className="text-xs font-semibold uppercase text-orange-700 mb-1">Best Option</p>
          <p className="text-2xl font-bold text-orange-600 mb-2">{bestBank.bankName}</p>
          <p className="text-sm text-orange-700">
            <span className="font-semibold">EMI: ₹{bestBank.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Save ₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month vs most expensive
          </p>
        </div>
      </div>

      {/* View Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {(['table', 'cards', 'chart'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-3 font-medium text-sm capitalize transition-colors whitespace-nowrap ${
              view === v
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {v === 'table' && 'Comparison Table'}
            {v === 'cards' && 'Bank Cards'}
            {v === 'chart' && 'Visual Chart'}
          </button>
        ))}
      </div>

      {/* Comparison View */}
      <div>
        {view === 'table' && (
          <BankComparisonTable
            comparisons={comparisons}
            bestBankId={bestBank.bankId}
          />
        )}
        {view === 'cards' && (
          <BankComparisonCards
            comparisons={comparisons}
            bestBankId={bestBank.bankId}
          />
        )}
        {view === 'chart' && (
          <BankComparisonChart
            comparisons={comparisons}
            bestBankId={bestBank.bankId}
          />
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">Disclaimer</p>
        <p>
          This calculator provides indicative estimates based on typical interest rates as of today.
          Actual EMI and interest rates may vary based on your credit score, co-applicant income,
          collateral value, and loan amount. These estimates do not constitute a loan offer or guarantee.
          Please contact banks directly to confirm rates and terms.
        </p>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to Apply?</h2>
        <p className="mb-4 text-orange-100">
          Connect with our experts to guide you through the application process.
        </p>
        <button
          onClick={() => router.push('/balance-transfer')}
          className="inline-block px-8 py-3 bg-white text-orange-600 font-semibold rounded-md hover:bg-orange-50 transition-colors"
        >
          Talk to a Loan Expert →
        </button>
      </div>
    </div>
  );
}
