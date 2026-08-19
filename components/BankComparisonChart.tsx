'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BankLoanComparison } from '@/lib/loan';

interface Props {
  comparisons: BankLoanComparison[];
  bestBankId: string;
}

export function BankComparisonChart({ comparisons, bestBankId }: Props) {
  // Prepare chart data
  const chartData = comparisons.map((comp) => ({
    name: comp.bankName,
    emi: Math.round(comp.emi),
    interest: Math.round(comp.totalInterest),
    bankId: comp.bankId,
  }));

  // Colors for bars
  const getBarColor = (bankId: string) => {
    return bankId === bestBankId ? '#E1622F' : '#2563EB';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900">{data.name}</p>
          <p className="text-sm text-orange-600">
            EMI: ₹{data.emi.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-blue-600">
            Total Interest: ₹{(data.interest / 100000).toFixed(1)}L
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* EMI Comparison Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly EMI Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'EMI (₹)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="emi" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.bankId)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-4 text-sm text-slate-600 text-center">
          Lower EMI = Better monthly affordability
        </p>
      </div>

      {/* Total Interest Comparison */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Total Interest Over Loan Tenure</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Interest (₹)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-white p-3 shadow-lg border border-slate-200">
                      <p className="font-semibold text-slate-900">{data.name}</p>
                      <p className="text-sm text-red-600">
                        Total Interest: ₹{(data.interest / 100000).toFixed(1)}L
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="interest" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.bankId)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-4 text-sm text-slate-600 text-center">
          Lower total interest = Better long-term value
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: 'Lowest EMI',
            value: comparisons[0].bankName,
            amount: `₹${comparisons[0].emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            color: 'orange',
          },
          {
            label: 'Lowest Interest',
            value: comparisons.reduce((a, b) => (a.totalInterest < b.totalInterest ? a : b)).bankName,
            amount: `₹${comparisons
              .reduce((a, b) => (a.totalInterest < b.totalInterest ? a : b))
              .totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            color: 'green',
          },
          {
            label: 'Price Range',
            value: 'EMI Difference',
            amount: `₹${(comparisons[comparisons.length - 1].emi - comparisons[0].emi).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            color: 'blue',
          },
        ].map((insight, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-4 ${
              insight.color === 'orange'
                ? 'bg-orange-50 border border-orange-200'
                : insight.color === 'green'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase ${
                insight.color === 'orange'
                  ? 'text-orange-700'
                  : insight.color === 'green'
                    ? 'text-green-700'
                    : 'text-blue-700'
              }`}
            >
              {insight.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{insight.value}</p>
            <p
              className={`mt-1 text-lg font-bold ${
                insight.color === 'orange'
                  ? 'text-orange-600'
                  : insight.color === 'green'
                    ? 'text-green-600'
                    : 'text-blue-600'
              }`}
            >
              {insight.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
