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

const CATEGORY_LABEL: Record<string, string> = {
  PSU: '🏛️ Public sector bank',
  Private: '🏢 Private bank',
  NBFC: '💼 NBFC',
};

const CATEGORY_TEXT: Record<string, string> = {
  PSU: 'text-blue-700',
  Private: 'text-red-700',
  NBFC: 'text-purple-700',
};

export function LenderComparisonCards({ quotes, bestLenderId }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {quotes.map((q) => {
        const isBest = q.lenderId === bestLenderId && q.eligible;

        return (
          <div
            key={q.lenderId}
            className={`relative flex flex-col rounded-lg border-2 p-6 transition-all ${
              !q.eligible
                ? 'border-slate-200 bg-slate-50 opacity-70'
                : isBest
                  ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                  : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
            }`}
          >
            {isBest && (
              <div className="absolute -right-3 -top-3 inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                🏆 Cheapest overall
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">{q.lenderName}</h3>
              <p
                className={`mt-1 text-xs font-semibold uppercase ${
                  CATEGORY_TEXT[q.lender.category] ?? 'text-slate-700'
                }`}
              >
                {CATEGORY_LABEL[q.lender.category] ?? q.lender.category}
              </p>
            </div>

            {!q.eligible ? (
              <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Unavailable</p>
                <p className="mt-1 text-sm text-slate-600">{q.ineligibleReason}</p>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-lg bg-white/60 p-3">
                  <p className="text-xs text-slate-600">
                    Rate band · {q.lender.rate_type}
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatRateBand(q.lender.rate_min, q.lender.rate_max)}
                  </p>
                </div>

                <div className="mb-4 space-y-3">
                  {/* Primary comparison metric */}
                  <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-3">
                    <p className="text-xs font-semibold uppercase text-orange-700">
                      Total interest · full loan life
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatINR(q.best.totalInterest)}
                    </p>
                    <p className="text-xs text-orange-700">
                      up to {formatINR(q.worst.totalInterest)} at their top rate
                    </p>
                  </div>

                  {/* The two payment figures, kept distinct */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-slate-600">During moratorium</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {q.best.moratoriumMonthlyPayment > 0
                          ? `${formatINR(q.best.moratoriumMonthlyPayment)}/mo`
                          : '₹0'}
                      </p>
                      <p className="text-xs text-slate-500">for {q.moratoriumMonths} months</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">EMI after moratorium</p>
                      <p className="text-sm font-semibold text-slate-900">
                        from {formatINR(q.best.emi)}
                      </p>
                      <p className="text-xs text-slate-500">up to {formatINR(q.worst.emi)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-slate-600">Principal at EMI start</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatINR(q.best.principalAtRepaymentStart)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {q.best.principalAtRepaymentStart > q.best.principal
                          ? `+${formatINR(q.best.principalAtRepaymentStart - q.best.principal)} capitalised`
                          : 'unchanged'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Processing fee</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatINRRange(q.processingFeeMin, q.processingFeeMax)}
                      </p>
                      <p className="text-xs text-slate-500">{q.processingFeeBasis}</p>
                    </div>
                  </div>

                  <div className="rounded border border-slate-200 bg-white/60 p-2">
                    <p className="text-xs font-medium text-slate-900">
                      {formatMoratoriumType(
                        q.lender.moratorium_type,
                        q.lender.partial_interest_pct
                      )}
                    </p>
                  </div>

                  {q.tenureCapped && (
                    <p className="text-xs font-medium text-amber-700">
                      Repayment capped to {q.tenureUsedYears} yr (lender maximum)
                    </p>
                  )}
                  {q.collateralNote && (
                    <p className="text-xs text-slate-500">{q.collateralNote}</p>
                  )}
                </div>
              </>
            )}

            <div className="mt-auto">
              <p
                className={`mb-2 text-xs ${q.stale ? 'font-semibold text-amber-700' : 'text-slate-500'}`}
              >
                Rate verified {formatDaysAgo(q.daysSinceVerified)}
              </p>
              <button
                disabled={!q.eligible}
                className={`w-full rounded-md px-4 py-3 font-semibold transition-all ${
                  !q.eligible
                    ? 'cursor-not-allowed border-2 border-slate-200 text-slate-400'
                    : isBest
                      ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
                      : 'border-2 border-slate-300 text-slate-900 hover:border-slate-400 active:scale-95'
                }`}
              >
                {!q.eligible ? 'Needs collateral' : isBest ? 'Apply Now' : 'Compare'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
