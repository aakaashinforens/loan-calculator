'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LenderQuote } from '@/lib/loan';
import { formatINR, formatINRCompact } from '@/lib/format';

interface Props {
  quotes: LenderQuote[];
  bestLenderId: string;
}

interface RangeDatum {
  name: string;
  lenderId: string;
  rateBand: string;
  emiLow: number;
  emiHigh: number;
  emiSpan: number;
  interestLow: number;
  interestHigh: number;
  interestSpan: number;
}

const BEST = '#E1622F';
const OTHER = '#2563EB';

/**
 * Floating bars are drawn as a two-part stack: an invisible base up to the low
 * value, then the visible span. Recharts' array-valued `dataKey` renders empty
 * rectangles once `<Cell>` children are involved, so the stack is the reliable
 * way to colour each lender's bar individually.
 */
function RangeChart({
  data,
  bestLenderId,
  baseKey,
  spanKey,
  lowKey,
  highKey,
  unitLabel,
  pad,
}: {
  data: RangeDatum[];
  bestLenderId: string;
  baseKey: 'emiLow' | 'interestLow';
  spanKey: 'emiSpan' | 'interestSpan';
  lowKey: 'emiLow' | 'interestLow';
  highKey: 'emiHigh' | 'interestHigh';
  unitLabel: string;
  pad: number;
}) {
  const low = Math.min(...data.map((d) => d[lowKey]));
  const high = Math.max(...data.map((d) => d[highKey]));
  const domain: [number, number] = [Math.max(0, low - pad), high + pad];

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={110} tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v: number) => formatINRCompact(v)}
          domain={domain}
          allowDataOverflow
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null;
            const d: RangeDatum = payload[0].payload;
            return (
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <p className="font-semibold text-slate-900">{d.name}</p>
                <p className="text-xs text-slate-500">{d.rateBand}</p>
                <p className="mt-1 text-sm text-orange-600">
                  {unitLabel} from {formatINR(d[lowKey])}
                </p>
                <p className="text-sm text-blue-600">up to {formatINR(d[highKey])}</p>
              </div>
            );
          }}
        />
        {/* Invisible pedestal that lifts the visible span off the axis. */}
        <Bar dataKey={baseKey} stackId="range" fill="transparent" isAnimationActive={false} />
        <Bar dataKey={spanKey} stackId="range" radius={[6, 6, 6, 6]} minPointSize={3}>
          {data.map((d) => (
            <Cell key={d.lenderId} fill={d.lenderId === bestLenderId ? BEST : OTHER} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LenderComparisonChart({ quotes, bestLenderId }: Props) {
  // The caller passes only eligible lenders; with none there is nothing to plot.
  if (quotes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        No lender will write this loan on the selected terms, so there is nothing to chart.
        Switch collateral status to Secured, or lower the loan amount.
      </div>
    );
  }

  const data: RangeDatum[] = quotes.map((q) => {
    const emiLow = Math.round(q.best.emi);
    const emiHigh = Math.round(q.worst.emi);
    const interestLow = Math.round(q.best.totalInterest);
    const interestHigh = Math.round(q.worst.totalInterest);
    return {
      name: q.lenderName,
      lenderId: q.lenderId,
      rateBand: `${q.lender.rate_min.toFixed(2)}% – ${q.lender.rate_max.toFixed(2)}%`,
      emiLow,
      emiHigh,
      emiSpan: emiHigh - emiLow,
      interestLow,
      interestHigh,
      interestSpan: interestHigh - interestLow,
    };
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Monthly EMI range</h3>
        <p className="mb-4 mt-1 text-sm text-slate-600">
          Each bar spans the lender&rsquo;s published band — the bottom is their best-case rate,
          the top their worst.
        </p>
        <RangeChart
          data={data}
          bestLenderId={bestLenderId}
          baseKey="emiLow"
          spanKey="emiSpan"
          lowKey="emiLow"
          highKey="emiHigh"
          unitLabel="EMI"
          pad={2000}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Total interest range</h3>
        <p className="mb-4 mt-1 text-sm text-slate-600">
          Interest across the whole loan life, moratorium included. Excludes processing fees.
        </p>
        <RangeChart
          data={data}
          bestLenderId={bestLenderId}
          baseKey="interestLow"
          spanKey="interestSpan"
          lowKey="interestLow"
          highKey="interestHigh"
          unitLabel="Interest"
          pad={50_000}
        />
      </div>
    </div>
  );
}
