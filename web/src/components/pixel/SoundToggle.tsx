'use client';

import React, { useEffect, useState } from 'react';
import { isSoundEnabled, setSoundEnabled, playPixelSound } from '@/lib/pixel-sound';
import { PixelButton } from './PixelButton';
import { PixelIcon } from './PixelIcon';

interface SoundToggleProps {
  className?: string;
  variant?: 'button' | 'compact';
}

export function SoundToggle({ className = '', variant = 'compact' }: SoundToggleProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isSoundEnabled());
    const onSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail !== undefined) {
        setEnabled(customEvent.detail.enabled);
      }
    };
    window.addEventListener('pixel-sound-change', onSoundChange);
    return () => window.removeEventListener('pixel-sound-change', onSoundChange);
  }, []);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      playPixelSound('fanfare');
    }
  };

  if (variant === 'button') {
    return (
      <PixelButton
        variant={enabled ? 'primary' : 'stone'}
        onClick={handleToggle}
        className={className}
        aria-label={`SFX ${enabled ? 'ON' : 'OFF'} - Sound effects: ${enabled ? 'enabled' : 'muted'}`}
        title={`Sound effects: ${enabled ? 'ENABLED' : 'MUTED'} (Click to toggle)`}
      >
        <span className="flex items-center gap-1.5">
          <PixelIcon name={enabled ? 'star' : 'gear'} size={16} />
          <span>SFX {enabled ? 'ON' : 'OFF'}</span>
        </span>
      </PixelButton>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`px-panel px-panel--stone p-1.5 flex items-center gap-1.5 cursor-pointer hover:brightness-110 active:brightness-95 transition-all text-xs font-pixel ${
        enabled ? 'text-emerald-400 border-emerald-600' : 'text-slate-200 border-stone-600'
      } ${className}`}
      aria-label={`SFX ${enabled ? 'ON' : 'OFF'} - Sound effects: ${enabled ? 'enabled' : 'muted'}. Click to toggle.`}
      title={`Sound effects: ${enabled ? 'ON' : 'OFF'} (Click to toggle)`}
    >
      <span aria-hidden="true" className="text-sm">
        {enabled ? '🔊' : '🔇'}
      </span>
      <span className="text-[9px] uppercase hidden sm:inline">
        {enabled ? 'SFX ON' : 'SFX OFF'}
      </span>
    </button>
  );
}
