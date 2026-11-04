'use client';

import { useState, useEffect, useCallback } from 'react';
import { playPixelSound } from '@/lib/pixel-sound';

export type WorldTheme = 'night' | 'day' | 'sunset';

export function useWorldTheme() {
  const [theme, setThemeState] = useState<WorldTheme>('night');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('pixel_vibe') as WorldTheme | null;
      if (saved && (saved === 'day' || saved === 'sunset' || saved === 'night')) {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
        (window as any).__pixel_time = saved;
      } else {
        const docTheme = document.documentElement.getAttribute('data-theme') as WorldTheme | null;
        if (docTheme && (docTheme === 'day' || docTheme === 'sunset' || docTheme === 'night')) {
          setThemeState(docTheme);
        } else {
          document.documentElement.setAttribute('data-theme', 'night');
        }
      }
    } catch {
      document.documentElement.setAttribute('data-theme', 'night');
    }

    const onTimeChange = (e: Event) => {
      const custom = e as CustomEvent<{ time: WorldTheme }>;
      if (custom.detail?.time) {
        setThemeState(custom.detail.time);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', custom.detail.time);
        }
      }
    };

    window.addEventListener('pixel-time-change', onTimeChange);
    return () => window.removeEventListener('pixel-time-change', onTimeChange);
  }, []);

  const switchTheme = useCallback((newTheme: WorldTheme) => {
    setThemeState(newTheme);
    try {
      playPixelSound('click');
    } catch {}
    if (typeof window !== 'undefined') {
      (window as any).__pixel_time = newTheme;
      try {
        localStorage.setItem('pixel_vibe', newTheme);
      } catch {}
      document.documentElement.setAttribute('data-theme', newTheme);
      window.dispatchEvent(new CustomEvent('pixel-time-change', { detail: { time: newTheme } }));
    }
  }, []);

  const cycleTheme = useCallback(() => {
    const seq: WorldTheme[] = ['night', 'day', 'sunset'];
    const next = seq[(seq.indexOf(theme) + 1) % seq.length];
    switchTheme(next);
  }, [theme, switchTheme]);

  return { theme, switchTheme, cycleTheme };
}
