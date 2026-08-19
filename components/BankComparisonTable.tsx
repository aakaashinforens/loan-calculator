import { BankLoanComparison } from '@/lib/loan';
import { getBankById } from '@/lib/banks';

interface Props {
  comparisons: BankLoanComparison[];
  bestBankId: string;
}

export function BankComparisonTable({ comparisons, bestBankId }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-900">Bank</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Interest Rate</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Monthly EMI</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Total Interest</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Total Payment</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((comp, idx) => {
            const bank = getBankById(comp.bankId);
            const isBest = comp.bankId === bestBankId;
            const isAlt = idx % 2 === 1;

            return (
              <tr
                key={comp.bankId}
                className={`border-b border-slate-200 transition-colors ${
                  isBest
                    ? 'bg-orange-50 hover:bg-orange-100'
                    : isAlt
                      ? 'bg-slate-50 hover:bg-slate-100'
                      : 'bg-white hover:bg-slate-50'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{comp.bankName}</span>
                    {isBest && (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                        Best Rate
                      </span>
                    )}
                    {bank && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          bank.type === 'psu'
                            ? 'bg-blue-100 text-blue-700'
                            : bank.type === 'private'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {bank.type.toUpperCase()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-slate-900">{comp.interestRate.toFixed(2)}%</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-slate-900">
                    ₹{comp.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-slate-600">
                    ₹{comp.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-slate-600">
                    ₹{comp.totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary below table */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-900">Lowest EMI</p>
            <p className="text-orange-600">
              {comparisons[0].bankName} - ₹{comparisons[0].emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Highest EMI</p>
            <p className="text-red-600">
              {comparisons[comparisons.length - 1].bankName} - ₹{comparisons[comparisons.length - 1].emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">EMI Difference</p>
            <p className="text-blue-600">
              ₹{(comparisons[comparisons.length - 1].emi - comparisons[0].emi).toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
