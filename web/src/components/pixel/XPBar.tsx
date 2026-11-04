interface XPBarProps {
  /** 0 to 1, e.g. scroll progress. */
  value: number;
  level: number;
  label?: string;
  showPct?: boolean;
}

/** Luminous, high-contrast XP progress bar with glowing emerald fill and illuminated LVL badge */
export function XPBar({ value, level, label = 'Scroll progress', showPct = true }: XPBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="px-xp">
      <div className="px-xp__badge">
        <span className="text-amber-400 font-bold">LVL</span>
        <span className="text-white font-bold">{level}</span>
      </div>
      <div
        className="px-xp__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`Level ${level}, ${pct} percent`}
      >
        <div className="px-xp__fill" style={{ width: `${pct}%` }} />
      </div>
      {showPct && (
        <span className="font-pixel text-[11px] text-lime-400 font-bold whitespace-nowrap min-w-[36px] text-right" aria-hidden="true">
          {pct}%
        </span>
      )}
    </div>
  );
}
