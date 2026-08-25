'use client';

import { useState } from 'react';
import { LenderQuote } from '@/lib/loan';
import {
  formatDaysAgo,
  formatINR,
  formatINRRange,
  formatMoratoriumType,
  formatRateBand,
} from '@/lib/format';

interface Props {
  quotes: LenderQuote[];
  bestLenderId: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  PSU: 'bg-blue-100 text-blue-700',
  Private: 'bg-red-100 text-red-700',
  NBFC: 'bg-purple-100 text-purple-700',
};

/** One label/value pair inside the expanded detail row. */
function Detail({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

export function LenderComparisonTable({ quotes, bestLenderId }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Summary stats describe only lenders that will actually write this loan.
  const eligible = quotes.filter((q) => q.eligible);
  const cheapest = eligible[0];
  const dearest = eligible[eligible.length - 1];

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[64rem] text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-900">Lender</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Rate band</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">
              During moratorium
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">
              EMI after moratorium
            </th>
            <th className="border-x-2 border-orange-200 bg-orange-50 px-4 py-3 text-right font-semibold text-orange-900">
              Total interest
              <span className="block text-xs font-medium text-orange-700">
                full loan life · compare on this
              </span>
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Processing fee</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Verified</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {quotes.map((q, idx) => {
            const isBest = q.lenderId === bestLenderId && q.eligible;
            const isAlt = idx % 2 === 1;
            const isOpen = expanded === q.lenderId;
            const rowTint = !q.eligible
              ? 'bg-slate-50 text-slate-400'
              : isBest
                ? 'bg-orange-50 hover:bg-orange-100'
                : isAlt
                  ? 'bg-slate-50 hover:bg-slate-100'
                  : 'bg-white hover:bg-slate-50';

            return [
              <tr
                key={q.lenderId}
                className={`border-b border-slate-200 align-top transition-colors ${rowTint}`}
              >
                {/* Lender */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-semibold ${q.eligible ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                      {q.lenderName}
                    </span>
                    {isBest && (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                        Cheapest overall
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        CATEGORY_STYLES[q.lender.category] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {q.lender.category.toUpperCase()}
                    </span>
                    {!q.eligible && (
                      <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {!q.eligible && (
                    <p className="mt-1 text-xs text-slate-500">{q.ineligibleReason}</p>
                  )}
                  {q.eligible && q.collateralNote && (
                    <p className="mt-1 text-xs text-slate-500">{q.collateralNote}</p>
                  )}
                </td>

                {/* Rate band */}
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-semibold ${q.eligible ? 'text-slate-900' : 'text-slate-400'}`}
                  >
                    {formatRateBand(q.lender.rate_min, q.lender.rate_max)}
                  </span>
                  <p className="mt-0.5 text-xs capitalize text-slate-500">{q.lender.rate_type}</p>
                </td>

                {/* Monthly payment DURING the moratorium */}
                <td className="px-4 py-3 text-right">
                  {q.eligible ? (
                    q.best.moratoriumMonthlyPayment > 0 ? (
                      <>
                        <span className="font-semibold text-slate-900">
                          {formatINR(q.best.moratoriumMonthlyPayment)}
                        </span>
                        <p className="mt-0.5 text-xs text-slate-500">
                          /month for {q.moratoriumMonths} mo
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-slate-900">₹0</span>
                        <p className="mt-0.5 text-xs text-slate-500">nothing paid</p>
                      </>
                    )
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* EMI after the moratorium */}
                <td className="px-4 py-3 text-right">
                  {q.eligible ? (
                    <>
                      <span className="font-semibold text-slate-900">
                        from {formatINR(q.best.emi)}
                      </span>
                      <p className="mt-0.5 text-xs text-slate-500">
                        up to {formatINR(q.worst.emi)}
                      </p>
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* PRIMARY METRIC: total interest over the full loan life */}
                <td className="border-x-2 border-orange-200 bg-orange-50/60 px-4 py-3 text-right">
                  {q.eligible ? (
                    <>
                      <span className="text-base font-bold text-slate-900">
                        {formatINR(q.best.totalInterest)}
                      </span>
                      <p className="mt-0.5 text-xs text-slate-600">
                        up to {formatINR(q.worst.totalInterest)}
                      </p>
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Processing fee */}
                <td className="px-4 py-3 text-right">
                  <span className={q.eligible ? 'text-slate-900' : 'text-slate-400'}>
                    {formatINRRange(q.processingFeeMin, q.processingFeeMax)}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-500">{q.processingFeeBasis}</p>
                </td>

                {/* Verified */}
                <td className="px-4 py-3 text-right">
                  <span
                    className={`text-xs ${q.stale ? 'font-semibold text-amber-700' : 'text-slate-500'}`}
                  >
                    {formatDaysAgo(q.daysSinceVerified)}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-400">{q.lender.last_verified}</p>
                </td>

                {/* Expand */}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : q.lenderId)}
                    aria-expanded={isOpen}
                    aria-controls={`detail-${q.lenderId}`}
                    className="whitespace-nowrap rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-white"
                  >
                    {isOpen ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>,

              isOpen ? (
                <tr key={`${q.lenderId}-detail`} id={`detail-${q.lenderId}`} className="bg-white">
                  <td colSpan={8} className="border-b-2 border-orange-200 px-4 py-5">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <Detail
                        label="Disbursed principal"
                        value={formatINR(q.best.principal)}
                        note="What the lender actually pays out"
                      />
                      <Detail
                        label="Interest during moratorium"
                        value={formatINR(q.best.moratoriumInterest)}
                        note={formatMoratoriumType(
                          q.lender.moratorium_type,
                          q.lender.partial_interest_pct
                        )}
                      />
                      <Detail
                        label="Effective principal at EMI start"
                        value={formatINR(q.best.principalAtRepaymentStart)}
                        note={
                          q.best.principalAtRepaymentStart > q.best.principal
                            ? `Grown by ${formatINR(
                                q.best.principalAtRepaymentStart - q.best.principal
                              )} — this is what the EMI is calculated on`
                            : 'Unchanged, because interest was serviced monthly'
                        }
                      />
                      <Detail
                        label="Total cost"
                        value={formatINR(q.best.totalCost)}
                        note={`Includes ${formatINR(q.processingFeeMin)} processing fee`}
                      />
                      <Detail
                        label="Moratorium"
                        value={`${q.moratoriumMonths} months`}
                        note={`Course + ${q.lender.moratorium_grace_months} mo grace`}
                      />
                      <Detail
                        label="Repayment"
                        value={`${q.tenureUsedYears} years (${q.best.months} EMIs)`}
                        note={
                          q.tenureCapped
                            ? `Capped — lender maximum is ${q.lender.max_repayment_tenure_years} yr`
                            : `Lender allows up to ${q.lender.max_repayment_tenure_years} yr`
                        }
                      />
                      <Detail
                        label="Total loan life"
                        value={`${q.best.totalDurationMonths} months`}
                        note="Moratorium plus repayment"
                      />
                      <Detail
                        label="Paid during moratorium"
                        value={formatINR(q.best.moratoriumPayment)}
                        note={
                          q.best.moratoriumPayment > 0
                            ? `${formatINR(q.best.moratoriumMonthlyPayment)} × ${q.moratoriumMonths} months`
                            : 'Nothing — it was added to the principal instead'
                        }
                      />
                    </div>

                    {q.lender.eligibility_notes.length > 0 && (
                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Lender notes
                        </p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                          {q.lender.eligibility_notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ) : null,
            ];
          })}
        </tbody>
      </table>

      {cheapest && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-slate-900">Cheapest overall</p>
              <p className="text-orange-600">
                {cheapest.lenderName} — {formatINR(cheapest.best.totalInterest)} interest
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Most expensive</p>
              <p className="text-red-600">
                {dearest.lenderName} — {formatINR(dearest.best.totalInterest)} interest
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Difference</p>
              <p className="text-blue-600">
                {formatINR(dearest.best.totalInterest - cheapest.best.totalInterest)} over the loan
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Ranked by total interest, not EMI. A lender that makes you service interest monthly
            shows a lower EMI simply because its principal never grows — that does not make the
            loan cheaper. EMI range across eligible lenders:{' '}
            {formatINRRange(cheapest.best.emi, dearest.worst.emi)}.
          </p>
        </div>
      )}
    </div>
  );
}
