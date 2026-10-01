/** Contrôle segmenté (DESIGN §3.7). */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; disabled?: boolean }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex rounded-button border border-line bg-table p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={`min-h-12 flex-1 rounded-key px-2 text-sm font-bold transition-colors disabled:opacity-40 ${
              active ? 'bg-ink text-white shadow-token' : 'text-ink-soft'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
