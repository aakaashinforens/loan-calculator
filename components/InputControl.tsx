"use client";

interface InputControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** How to render the current value in the field badge (e.g. ₹, %). */
  format: (value: number) => string;
  /** Optional unit suffix shown next to the raw number input. */
  suffix?: string;
}

export default function InputControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  suffix,
}: InputControlProps) {
  const percent = ((value - min) / (max - min)) * 100;

  function handleRaw(raw: string) {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) onChange(parsed);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-muted">{label}</label>
        <div className="flex items-center gap-1 rounded-btn border border-black/10 bg-surface px-2 py-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleRaw(e.target.value)}
            className="w-24 bg-transparent text-right text-sm font-semibold text-ink outline-none"
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
