interface ResultCardProps {
  label: string;
  value: string;
  /** Highlight the primary metric (EMI) with the brand accent. */
  emphasis?: boolean;
  hint?: string;
}

export default function ResultCard({ label, value, emphasis, hint }: ResultCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors duration-150 ease-inforens ${
        emphasis
          ? "border-primary/30 bg-primary/5"
          : "border-black/10 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          emphasis ? "text-primary" : "text-ink"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
