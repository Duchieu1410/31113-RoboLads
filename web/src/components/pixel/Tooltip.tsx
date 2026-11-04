'use client';

import { useId, useState, type ReactNode } from 'react';

interface TooltipProps {
  /** First line, rendered gold. */
  title: string;
  /** Extra lines in white. */
  lines?: string[];
  side?: 'top' | 'bottom';
  /** Force open (showcase only). */
  forceOpen?: boolean;
  children: ReactNode;
}

/**
 * Item-style tooltip. Opens on hover AND keyboard focus (so touch taps, which focus, work too),
 * closes on Escape, and is linked with aria-describedby.
 */
export function Tooltip({ title, lines = [], side = 'top', forceOpen, children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const shown = forceOpen || open;
  return (
    <span
      className="px-tip"
      aria-describedby={id}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      {children}
      <span id={id} role="tooltip" className="px-tip__bubble" data-side={side} hidden={!shown}>
        <span className="px-tip__title">{title}</span>
        {lines.map((l) => (
          <span key={l} style={{ display: 'block' }}>
            {l}
          </span>
        ))}
      </span>
    </span>
  );
}
