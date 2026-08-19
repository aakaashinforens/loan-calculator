import { BankLoanComparison } from '@/lib/loan';
import { getBankById } from '@/lib/banks';

interface Props {
  comparisons: BankLoanComparison[];
  bestBankId: string;
}

export function BankComparisonCards({ comparisons, bestBankId }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {comparisons.map((comp) => {
        const bank = getBankById(comp.bankId);
        const isBest = comp.bankId === bestBankId;

        return (
          <div
            key={comp.bankId}
            className={`relative rounded-lg border-2 p-6 transition-all ${
              isBest
                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
            }`}
          >
            {/* Best rate badge */}
            {isBest && (
              <div className="absolute -top-3 -right-3 inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                🏆 Best Rate
              </div>
            )}

            {/* Bank name and type */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900">{comp.bankName}</h3>
              {bank && (
                <p
                  className={`text-xs font-semibold uppercase mt-1 ${
                    bank.type === 'psu'
                      ? 'text-blue-700'
                      : bank.type === 'private'
                        ? 'text-red-700'
                        : 'text-purple-700'
                  }`}
                >
                  {bank.type === 'psu'
                    ? '🏛️ Public Sector Bank'
                    : bank.type === 'private'
                      ? '🏢 Private Bank'
                      : '💼 NBFC'}
                </p>
              )}
            </div>

            {/* Interest rate */}
            <div className="mb-4 rounded-lg bg-white/60 p-3">
              <p className="text-xs text-slate-600">Interest Rate</p>
              <p className="text-2xl font-bold text-slate-900">{comp.interestRate.toFixed(2)}%</p>
            </div>

            {/* Key metrics */}
            <div className="space-y-3 mb-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-600">Monthly EMI</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{comp.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-600">Total Interest</p>
                  <p className="text-sm font-semibold text-slate-900">
                    ₹{(comp.totalInterest / 100000).toFixed(1)}L
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Total Payment</p>
                  <p className="text-sm font-semibold text-slate-900">
                    ₹{(comp.totalPayment / 100000).toFixed(1)}L
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              className={`w-full py-3 px-4 rounded-md font-semibold transition-all ${
                isBest
                  ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
                  : 'border-2 border-slate-300 text-slate-900 hover:border-slate-400 active:scale-95'
              }`}
            >
              {isBest ? 'Apply Now' : 'Compare'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
