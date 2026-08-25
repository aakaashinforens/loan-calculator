'use client';

import { useState, useMemo } from 'react';
import InputControl from './InputControl';
import { LENDERS, getLenderById } from '@/lib/lenders';
import { calculateTransferSavings, LOAN_LIMITS } from '@/lib/loan';
import { LeadCaptureForm } from './LeadCaptureForm';

export function BalanceTransferCalculator() {
  const [outstandingAmount, setOutstandingAmount] = useState(1_000_000); // ₹10L default
  const [currentRate, setCurrentRate] = useState(10);
  const [remainingTenure, setRemainingTenure] = useState(5); // years
  const [currentBank, setCurrentBank] = useState('sbi');
  const [showForm, setShowForm] = useState(false);

  // Calculate savings for each eligible bank
  const savings = useMemo(() => {
    const banksThatAcceptTransfer = LENDERS.filter((l) => l.accepts_balance_transfer);

    return banksThatAcceptTransfer
      .map((bank) =>
        calculateTransferSavings(
          outstandingAmount,
          currentRate,
          bank.balance_transfer_rate_typical,
          remainingTenure,
          bank.id,
          bank.lender
        )
      )
      .sort((a, b) => b.savings.perMonth - a.savings.perMonth); // Sort by savings (highest first)
  }, [outstandingAmount, currentRate, remainingTenure]);

  const bestSavings = savings[0];
  const totalSavingsAllBanks = savings.reduce((sum, s) => sum + s.savings.total, 0);

  if (showForm && bestSavings) {
    return (
      <LeadCaptureForm
        loanAmount={outstandingAmount}
        currentEmi={bestSavings.currentLoan.emi}
        potentialSavings={bestSavings.savings.total}
        currentBank={currentBank}
        onBack={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl">
          Balance Transfer Calculator
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Check if transferring your existing education loan can reduce your EMI and save money.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <InputControl
            label="Outstanding Loan (₹)"
            value={outstandingAmount}
            onChange={setOutstandingAmount}
            min={LOAN_LIMITS.amount.min}
            max={LOAN_LIMITS.amount.max}
            step={LOAN_LIMITS.amount.step}
            format={(val) => `₹${(val / 100000).toFixed(1)}L`}
          />
        </div>

        <div>
          <InputControl
            label="Current Interest Rate (%)"
            value={currentRate}
            onChange={setCurrentRate}
            min={7}
            max={16}
            step={0.5}
            format={(val) => `${val.toFixed(2)}%`}
          />
        </div>

        <div>
          <InputControl
            label="Remaining Tenure (Years)"
            value={remainingTenure}
            onChange={setRemainingTenure}
            min={1}
            max={15}
            step={1}
            format={(val) => `${val} years`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Current Bank
          </label>
          <select
            value={currentBank}
            onChange={(e) => setCurrentBank(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
          >
            {LENDERS.map((lender) => (
              <option key={lender.id} value={lender.id}>
                {lender.lender}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Current Loan */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-6">
          <p className="text-xs font-semibold uppercase text-slate-700 mb-1">Current Loan</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">
            ₹{bestSavings.currentLoan.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-slate-600">Monthly EMI</p>
          <p className="text-xs text-slate-500 mt-2">
            Total Interest: ₹{(bestSavings.currentLoan.totalInterest / 100000).toFixed(1)}L
          </p>
        </div>

        {/* Best Transfer Option */}
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 p-6">
          <p className="text-xs font-semibold uppercase text-orange-700 mb-1">Best Transfer Option</p>
          <p className="text-lg font-bold text-slate-900 mb-2">{bestSavings.newLoan.bankName}</p>
          <p className="text-3xl font-bold text-orange-600 mb-2">
            ₹{bestSavings.newLoan.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-orange-700">Monthly EMI at {bestSavings.newLoan.interestRate.toFixed(2)}%</p>
          <p className="text-xs text-orange-600 mt-2">
            Total Interest: ₹{(bestSavings.newLoan.totalInterest / 100000).toFixed(1)}L
          </p>
        </div>

        {/* Monthly Savings */}
        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-300 p-6">
          <p className="text-xs font-semibold uppercase text-green-700 mb-1">Potential Savings</p>
          <p className="text-3xl font-bold text-green-600 mb-2">
            ₹{bestSavings.savings.perMonth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-green-700">Every Month</p>
          <p className="text-xs text-green-600 mt-2">
            Total: ₹{(bestSavings.savings.total / 100000).toFixed(1)}L over {remainingTenure} years
          </p>
        </div>
      </div>

      {/* All Options Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Banks Offering Lower Rates</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Bank</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">Rate</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">New EMI</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">Monthly Savings</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">Total Savings</th>
              </tr>
            </thead>
            <tbody>
              {savings.map((s) => {
                const bank = getLenderById(s.newLoan.bankId);
                const isBest = s.newLoan.bankId === bestSavings.newLoan.bankId;

                return (
                  <tr
                    key={s.newLoan.bankId}
                    className={`border-b border-slate-200 ${
                      isBest ? 'bg-orange-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{s.newLoan.bankName}</span>
                        {isBest && (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                            🏆 Best
                          </span>
                        )}
                        {bank && (
                          <span className="text-xs font-medium px-2 py-1 rounded bg-slate-200 text-slate-700">
                            {bank.category.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-slate-900">
                        {s.newLoan.interestRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-slate-900">
                        ₹{s.newLoan.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-600 font-medium">
                        ₹{s.savings.perMonth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-600 font-medium">
                        ₹{(s.savings.total / 100000).toFixed(1)}L
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to Save ₹{(bestSavings.savings.total / 100000).toFixed(1)}L?</h2>
        <p className="mb-6 text-orange-100">
          Connect with our experts to guide you through the balance transfer process. We'll handle all the paperwork.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-block px-8 py-3 bg-white text-orange-600 font-semibold rounded-md hover:bg-orange-50 transition-colors"
        >
          Get Expert Help →
        </button>
      </div>

      {/* Eligibility Factors Section */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Eligibility Factors & Pricing Considerations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Required for Approval:</h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Clear repayment history with current lender</li>
              <li>• Minimum outstanding loan amount</li>
              <li>• Balance transfer for rate reduction or loan enhancement</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Factors Affecting Rate:</h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Applicant's academic credentials</li>
              <li>• Employment status and income (if employed)</li>
              <li>• Co-applicant income (if applicable)</li>
              <li>• Credit profile and repayment track record</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
        <p className="font-semibold mb-2">Important Disclaimer</p>
        <p className="mb-2">
          Loan balance transfer is subject to the lending institution's eligibility criteria, credit appraisal, documentation requirements, and approval process. Using this calculator does not constitute a loan offer or guarantee of financing.
        </p>
        <p className="mb-2">
          Actual interest rates, EMI, and eligibility may vary based on individual circumstances, academic profile, employment status, income level, and credit history. Rate reductions typically range from 1-1.25% for qualified applicants.
        </p>
        <p>
          Please contact the banks directly to confirm terms, conditions, exact rates, and your eligibility. Only the respective lending institution's formal approval letter constitutes a valid loan offer.
        </p>
      </div>
    </div>
  );
}
