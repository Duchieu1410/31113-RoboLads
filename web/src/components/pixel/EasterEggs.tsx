'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdvancements } from './AdvancementContext';
import { playPixelSound } from '@/lib/pixel-sound';
import { PixelPanel } from './PixelPanel';
import { PixelIcon } from './PixelIcon';
import { PixelSprite } from './PixelSprite';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function EasterEggs() {
  const { unlock } = useAdvancements();
  const [konamiProgress, setKonamiProgress] = useState(0);
  const [cerberusRunning, setCerberusRunning] = useState(false);

  // Konami Code sequence listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form inputs
      if (
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))
      ) {
        return;
      }

      const expectedKey = KONAMI_CODE[konamiProgress];
      const match =
        e.key === expectedKey ||
        (expectedKey.length === 1 && e.key.toLowerCase() === expectedKey.toLowerCase());

      if (match) {
        const nextProgress = konamiProgress + 1;
        if (nextProgress === KONAMI_CODE.length) {
          // Success!
          setKonamiProgress(0);
          setCerberusRunning(true);
          playPixelSound('fanfare');
          unlock('konami');

          setTimeout(() => {
            setCerberusRunning(false);
          }, 8000);
        } else {
          setKonamiProgress(nextProgress);
        }
      } else {
        // Reset or check if current key is start of sequence
        setKonamiProgress(e.key === 'ArrowUp' ? 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress, unlock]);

  // Window event trigger for /cerberus command
  useEffect(() => {
    const handleTrigger = () => {
      setCerberusRunning(true);
      playPixelSound('fanfare');
      unlock('konami');
      setTimeout(() => {
        setCerberusRunning(false);
      }, 8000);
    };
    window.addEventListener('pixel-cerberus-trigger', handleTrigger);
    return () => window.removeEventListener('pixel-cerberus-trigger', handleTrigger);
  }, [unlock]);

  if (!cerberusRunning) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-live="polite"
      role="region"
      aria-label="Secret Easter Egg Activation"
    >
      {/* Celebratory Banner */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto">
        <PixelPanel
          variant="stone"
          className="px-6 py-3 bg-amber-500/90 border-amber-300 shadow-2xl flex items-center gap-3 animate-bounce"
        >
          <PixelIcon name="star" size={32} />
          <div className="text-center">
            <span className="font-pixel text-xs sm:text-sm text-stone-900 block font-bold">
              ★ CERBERUS PROTOCOL UNLEASHED ★
            </span>
            <span className="font-pixelify text-xs text-stone-900 block font-semibold">
              Konami Code Activated! FTC Team #31113 Salutes You.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCerberusRunning(false)}
            className="font-pixel text-xs bg-stone-900 text-amber-300 px-2 py-1 border border-amber-400 hover:bg-black cursor-pointer"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </PixelPanel>
      </div>

      {/* Running Mascot Sprite Animation */}
      <div className="cerberus-runner absolute bottom-24 flex items-center gap-3">
        <PixelSprite
          name="cerberus"
          size={64}
          animated={true}
          alt="HSGS RoboLads 3-Headed Cerberus Cyber-Hound Sprite"
          className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] filter"
        />
        <div className="font-pixel text-[10px] sm:text-xs text-amber-300 bg-stone-900/95 border-2 border-amber-400 px-3 py-1.5 shadow-[3px_3px_0_#000000]">
          HSGS ROBOLADS // CERBERUS SPEED RUN
        </div>
      </div>
    </div>
  );
}
