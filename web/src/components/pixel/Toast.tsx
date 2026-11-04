'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PixelIcon } from './PixelIcon';
import type { PixelIconName } from './pixel-icons';
import { playBlip } from '@/lib/pixel-sound';

export interface ToastInput {
  /** Small title, e.g. "Achievement unlocked". */
  title: string;
  /** One plain-language line, e.g. "Opened the CAD lab". */
  message: string;
  icon?: PixelIconName;
}

interface ToastContextValue {
  push: (t: ToastInput) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_MS = 4000;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/** One toast at a time. Never blocks content. The live region is always mounted. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<(ToastInput & { id: number })[]>([]);
  const [muted, setMuted] = useState(false);
  const nextId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);

  const push = useCallback(
    (t: ToastInput) => {
      if (muted) return;
      setQueue((q) => [...q, { ...t, id: nextId.current++ }]);
    },
    [muted],
  );

  const current = queue[0];
  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), []);

  useEffect(() => {
    if (!current || paused) return;
    playBlip('toast');
    timer.current = setTimeout(dismiss, DISMISS_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [current, paused, dismiss]);

  const value = useMemo(() => ({ push, muted, setMuted }), [push, muted]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="px-toast-region" role="status" aria-live="polite">
        {current && (
          <AdvancementToast
            key={current.id}
            {...current}
            onDismiss={dismiss}
            onPause={setPaused}
          />
        )}
      </div>
    </ToastContext.Provider>
  );
}

interface AdvancementToastProps extends ToastInput {
  onDismiss?: () => void;
  onPause?: (paused: boolean) => void;
}

/** The toast itself. Pauses its timer on hover and keyboard focus. */
export function AdvancementToast({
  title,
  message,
  icon = 'star',
  onDismiss,
  onPause,
}: AdvancementToastProps) {
  return (
    <div
      className="px-toast"
      onMouseEnter={() => onPause?.(true)}
      onMouseLeave={() => onPause?.(false)}
      onFocus={() => onPause?.(true)}
      onBlur={() => onPause?.(false)}
    >
      <PixelIcon name={icon} size={32} />
      <div>
        <div className="px-toast__title">{title}</div>
        <div className="px-toast__line">{message}</div>
      </div>
      {onDismiss && (
        <button type="button" className="px-toast__close" onClick={onDismiss} aria-label="Dismiss notification">
          X
        </button>
      )}
    </div>
  );
}
