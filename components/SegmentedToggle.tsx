"use client";

interface Option<T extends string> {
  value: T;
  label: string;
  /** Short line shown under the switch when this option is active. */
  caption?: string;
}

interface SegmentedToggleProps<T extends string> {
  label: string;
  hint?: string;
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
}

/** Two-or-more-way switch styled to match the slider inputs. */
export default function SegmentedToggle<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: SegmentedToggleProps<T>) {
  const active = options.find((o) => o.value === value);

  return (
    <div className="space-y-3">
      <div>
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>

      <div
        role="radiogroup"
        aria-label={label}
        className="flex gap-1 rounded-btn border border-black/10 bg-surface p-1"
      >
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={`flex-1 rounded-btn px-3 py-2 text-sm font-semibold transition-colors duration-150 ease-inforens ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-white hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {active?.caption && <p className="text-xs text-muted">{active.caption}</p>}
    </div>
  );
}
