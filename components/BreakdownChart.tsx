"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatINR } from "@/lib/format";

interface BreakdownChartProps {
  principal: number;
  interest: number;
  /** Centre label — the monthly EMI string. */
  centerLabel: string;
  centerCaption?: string;
}

const PRINCIPAL_COLOR = "oklch(0.62 0.181 44.04)"; // brand orange
const INTEREST_COLOR = "oklch(0.82 0.09 44.04)"; // lighter tint

export default function BreakdownChart({
  principal,
  interest,
  centerLabel,
  centerCaption,
}: BreakdownChartProps) {
  const total = principal + interest;
  const data = [
    { name: "Principal", value: principal },
    { name: "Interest", value: interest },
  ];

  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={PRINCIPAL_COLOR} />
            <Cell fill={INTEREST_COLOR} />
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${formatINR(value)} (${total ? Math.round((value / total) * 100) : 0}%)`,
              name,
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)",
              fontSize: 12,
              fontFamily: "var(--font-poppins)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Monthly EMI
        </span>
        <span className="font-display text-2xl font-bold text-ink">{centerLabel}</span>
        {centerCaption && <span className="text-xs text-muted">{centerCaption}</span>}
      </div>
    </div>
  );
}
