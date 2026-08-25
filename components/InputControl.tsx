"use client";

import { useEffect, useRef, useState } from "react";

interface InputControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** How to render the min/max end labels under the slider (e.g. ₹10L, 15 yr). */
  format: (value: number) => string;
  /** Short clarification shown under the label. */
  hint?: string;
  /** Symbol shown before the number, e.g. ₹. */
  prefix?: string;
  /** Unit shown after the number, e.g. % or yrs. */
  suffix?: string;
  /** Decimal places kept in the typed field. Defaults to 0. */
  decimals?: number;
}

/** Strip grouping separators, currency symbols and stray spaces before parsing. */
function parseTyped(raw: string): number {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return NaN;
  return Number(cleaned);
}

export default function InputControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
  prefix,
  suffix,
  decimals = 0,
}: InputControlProps) {
  // While the field has focus the user's raw keystrokes win, so half-typed
  // values like "12" on the way to "1200000" are never reformatted underfoot.
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const grouped = value.toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });

  // Keep the field in step with the slider while the user drags it.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(null);
  }, [value]);

  function commit() {
    if (draft === null) return;
    const parsed = parseTyped(draft);
    if (!Number.isNaN(parsed)) {
      onChange(Math.min(Math.max(parsed, min), max));
    }
    setDraft(null);
  }

  function handleTyping(raw: string) {
    setDraft(raw);
    const parsed = parseTyped(raw);
    // Push through only in-range values as they are typed; anything out of
    // range is clamped on blur so the user can keep editing without a fight.
    if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) onChange(parsed);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <label className="text-sm font-medium text-ink">{label}</label>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>

        <div className="flex items-center gap-1 rounded-btn border border-black/10 bg-white px-2 py-1 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          {prefix && <span className="text-sm font-semibold text-muted">{prefix}</span>}
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={draft ?? grouped}
            onChange={(e) => handleTyping(e.target.value)}
            onFocus={(e) => {
              setDraft(String(value));
              e.target.select();
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commit();
                inputRef.current?.blur();
              }
            }}
            className="w-28 bg-transparent text-right text-sm font-semibold text-ink outline-none"
            aria-label={label}
          />
          {suffix && <span className="text-sm font-semibold text-muted">{suffix}</span>}
        </div>
      </div>

      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, oklch(0.62 0.181 44.04) ${percent}%, oklch(0.92 0.01 285.82) ${percent}%)`,
        }}
        className="w-full"
        aria-label={`${label} slider`}
      />

      <div className="flex justify-between text-xs text-muted">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
