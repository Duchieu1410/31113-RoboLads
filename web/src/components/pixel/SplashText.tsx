'use client';

import { useEffect, useState } from 'react';

/** Only facts that already appear on the current site. Do not invent claims. */
export const DEFAULT_SPLASHES = ['Built in Onshape', '40+ student engineers', 'Cerberus approved'] as const;

interface SplashTextProps {
  messages?: readonly string[];
  intervalMs?: number;
}

/** Rotated, pulsing gold text. Cycling and pulse stop under prefers-reduced-motion. */
export function SplashText({ messages = DEFAULT_SPLASHES, intervalMs = 4000 }: SplashTextProps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (messages.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), intervalMs);
    return () => clearInterval(t);
  }, [messages, intervalMs]);
  return <span className="px-splash">{messages[i]}</span>;
}
