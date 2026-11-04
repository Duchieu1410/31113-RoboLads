'use client';

import React, { useEffect, useRef } from 'react';
import { useAdvancements, ALL_ADVANCEMENTS } from './AdvancementContext';
import { PixelPanel } from './PixelPanel';
import { PixelButton } from './PixelButton';
import { PixelIcon } from './PixelIcon';
import { Slot } from './Slot';
import { playPixelSound } from '@/lib/pixel-sound';

export function AdvancementsModal() {
  const {
    advancements,
    isUnlocked,
    toastsMuted,
    setMuteToasts,
    isAdvancementsModalOpen,
    closeAdvancementsModal,
  } = useAdvancements();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Esc key
  useEffect(() => {
    if (!isAdvancementsModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAdvancementsModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus close button on open
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdvancementsModalOpen, closeAdvancementsModal]);

  if (!isAdvancementsModalOpen) return null;

  const unlockedCount = ALL_ADVANCEMENTS.filter((a) => isUnlocked(a.id)).length;
  const totalCount = ALL_ADVANCEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAdvancementsModal();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="advancements-modal-title"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <PixelPanel variant="night" className="flex flex-col max-h-[85vh] overflow-hidden p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-700/80">
            <div>
              <div className="flex items-center gap-2">
                <PixelIcon name="star" size={32} />
                <h2 id="advancements-modal-title" className="font-pixel text-base sm:text-lg text-amber-400">
                  ADVANCEMENTS
                </h2>
              </div>
              <p className="font-pixelify text-sm sm:text-base text-stone-300 mt-1">
                Progress: <span className="text-emerald-400 font-semibold">{unlockedCount}</span> / {totalCount} ({progressPercent}%)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-pixelify text-stone-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={toastsMuted}
                  onChange={(e) => setMuteToasts(e.target.checked)}
                  className="rounded bg-stone-800 border-stone-600 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Mute Toasts</span>
              </label>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeAdvancementsModal}
                className="px-button px-button--secondary font-pixel text-xs py-1 px-2.5 text-stone-300 hover:text-white cursor-pointer"
                aria-label="Close advancements modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-900 border border-stone-700 h-3 my-3 relative overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Advancements List */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Advancements list"
            className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
          >
            {ALL_ADVANCEMENTS.map((adv) => {
              const unlocked = isUnlocked(adv.id);
              const unlockedTime = advancements[adv.id];

              return (
                <div
                  key={adv.id}
                  className={`px-panel p-3 flex items-start gap-3 transition-colors ${
                    unlocked
                      ? 'px-panel--stone bg-stone-800/90 border-amber-600/60'
                      : 'px-panel--bedrock bg-stone-900/60 border-stone-800 opacity-60'
                  }`}
                >
                  <Slot selected={unlocked} aria-label={adv.title}>
                    <PixelIcon name={adv.icon} size={32} />
                  </Slot>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`font-pixel text-xs sm:text-sm truncate ${
                          unlocked ? 'text-amber-300' : 'text-stone-400'
                        }`}
                      >
                        {adv.title}
                      </h3>
                      <span
                        className={`font-pixel text-[9px] px-1.5 py-0.5 border ${
                          unlocked
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                            : 'bg-stone-950 text-stone-500 border-stone-800'
                        }`}
                      >
                        {unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>

                    <p className="font-body text-xs text-stone-300 mt-1 leading-relaxed">
                      {adv.description}
                    </p>

                    {unlocked && unlockedTime && (
                      <span className="font-pixelify text-[10px] text-stone-400 block mt-1">
                        Completed {new Date(unlockedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-stone-700/80 flex items-center justify-between text-xs font-pixelify text-stone-400">
            <span>Tip: Explore 3D CAD, read blog posts, or enter secret codes to unlock all.</span>
            <PixelButton
              variant="stone"
              className="text-xs py-1 px-3"
              onClick={closeAdvancementsModal}
            >
              Done
            </PixelButton>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}
