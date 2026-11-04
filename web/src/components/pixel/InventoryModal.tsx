'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdvancements } from './AdvancementContext';
import { PixelPanel } from './PixelPanel';
import { PixelButton } from './PixelButton';
import { PixelIcon } from './PixelIcon';
import { Slot } from './Slot';
import { Tooltip } from './Tooltip';
import { playPixelSound, isSoundEnabled, setSoundEnabled } from '@/lib/pixel-sound';
import { ROUTES } from '@/routes';

function isTyping(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

export function InventoryModal() {
  const router = useRouter();
  const {
    isInventoryModalOpen,
    openInventoryModal,
    closeInventoryModal,
    openAdvancementsModal,
    openCommandPalette,
    unlock,
  } = useAdvancements();

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Key listener for 'E'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (isInventoryModalOpen) {
          closeInventoryModal();
        } else {
          openInventoryModal();
          unlock('inventory');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInventoryModalOpen, openInventoryModal, closeInventoryModal, unlock]);

  // Esc key and initial focus
  useEffect(() => {
    if (!isInventoryModalOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeInventoryModal();
      }
    };

    window.addEventListener('keydown', handleEsc);
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 40);

    return () => window.removeEventListener('keydown', handleEsc);
  }, [isInventoryModalOpen, closeInventoryModal]);

  if (!isInventoryModalOpen) return null;

  const handleAction = (type: string) => {
    playPixelSound('click');
    closeInventoryModal();

    switch (type) {
      case 'robot': {
        const el = document.getElementById('robot-target');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else router.push('/#robot-target');
        break;
      }
      case 'story': {
        const el = document.getElementById('about-target');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else router.push('/#about-target');
        break;
      }
      case 'quests': {
        const el = document.getElementById('activities-target');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else router.push('/#activities-target');
        break;
      }
      case 'resources': {
        router.push(ROUTES.RESOURCES);
        break;
      }
      case 'blog': {
        router.push(ROUTES.BLOG);
        break;
      }
      case 'sound': {
        const next = !isSoundEnabled();
        setSoundEnabled(next);
        if (next) playPixelSound('fanfare');
        break;
      }
      case 'team': {
        const el = document.getElementById('about-target');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else router.push('/#about-target');
        break;
      }
      case 'console': {
        openCommandPalette();
        break;
      }
      case 'spawn': {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }
      default:
        break;
    }
  };

  const inventorySlots = [
    { id: 'robot', label: '3D DecodeBot CAD', icon: 'gear' as const, desc: 'Jump to interactive 3D assembly' },
    { id: 'story', label: 'Origin Story', icon: 'compass' as const, desc: 'Jump to team founding and lab history' },
    { id: 'quests', label: 'Core Quests', icon: 'sword' as const, desc: 'Browse outreach and engineering quests' },
    { id: 'resources', label: 'Engineering Chest', icon: 'chest' as const, desc: 'Open open-source CAD & code docs' },
    { id: 'blog', label: 'Written Books', icon: 'book' as const, desc: 'Read team dispatches and build logs' },
    { id: 'sound', label: '8-Bit SFX Module', icon: 'star' as const, desc: 'Toggle synthesized audio blips' },
    { id: 'team', label: 'RoboLads Team', icon: 'star' as const, desc: 'FTC #31113 Roster & Mentors' },
    { id: 'console', label: 'Command Console', icon: 'redstone' as const, desc: 'Open terminal palette (/)' },
    { id: 'spawn', label: 'Spawn Compass', icon: 'compass' as const, desc: 'Teleport back to top of world' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeInventoryModal();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Player Inventory"
        className="w-full max-w-xl flex flex-col"
      >
        <PixelPanel variant="stone" className="p-4 sm:p-6 bg-stone-900 border-stone-600">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-700">
            <div className="flex items-center gap-2">
              <PixelIcon name="chest" size={32} />
              <h2 className="font-pixel text-sm sm:text-base text-amber-400">
                TEAM INVENTORY [E]
              </h2>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeInventoryModal}
              className="px-button px-button--secondary font-pixel text-xs py-1 px-2.5 text-stone-300 hover:text-white cursor-pointer"
              aria-label="Close inventory"
            >
              ✕
            </button>
          </div>

          {/* Upper Section: Player Stats & Roster */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {/* Player Character Card */}
            <div className="px-panel px-panel--night p-3 flex items-center gap-3 bg-stone-950/80">
              <div className="w-16 h-16 bg-stone-900 border-2 border-stone-700 flex items-center justify-center relative overflow-hidden">
                <span className="font-pixel text-2xl" aria-hidden="true">
                  🤖
                </span>
                <span className="absolute bottom-0 inset-x-0 bg-amber-500/20 text-[8px] font-pixel text-center text-amber-300">
                  #31113
                </span>
              </div>
              <div className="text-xs font-pixelify space-y-1">
                <div className="font-pixel text-xs text-amber-400">CERBERUS // DECODEBOT</div>
                <div className="text-stone-300">Team: HSGS RoboLads</div>
                <div className="text-stone-400">Division: FIRST Tech Challenge Vietnam</div>
              </div>
            </div>

            {/* Subsystem Crafting Info */}
            <div className="px-panel px-panel--bedrock p-3 text-xs font-pixelify space-y-1.5 bg-black/60">
              <div className="font-pixel text-[10px] text-amber-400 flex items-center gap-1.5">
                <PixelIcon name="wrench" size={16} />
                ROBOT SPECIFICATIONS
              </div>
              <p className="text-stone-300">
                Chassis: Pocketed 4WD dead-axle
              </p>
              <p className="text-stone-300">
                Sensors: Dual Rev Color + SparkFun ToF
              </p>
              <p className="text-stone-400 text-[11px]">
                Tip: Click any inventory item below to equip or jump.
              </p>
            </div>
          </div>

          {/* Lower Section: 9-Slot Hotbar Grid */}
          <div className="pt-2 border-t border-stone-700">
            <h3 className="font-pixel text-xs text-stone-300 mb-3 flex items-center justify-between">
              <span>QUICK SLOTS</span>
              <span className="text-[10px] text-stone-400 font-pixelify">Click slot to activate</span>
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {inventorySlots.map((item, index) => (
                <Tooltip
                  key={item.id}
                  title={item.label}
                  lines={[item.desc]}
                  side="top"
                >
                  <button
                    type="button"
                    onClick={() => handleAction(item.id)}
                    className="w-full aspect-square flex flex-col items-center justify-center cursor-pointer group"
                    aria-label={`${index + 1}. ${item.label} - ${item.desc}`}
                  >
                    <Slot className="group-hover:border-amber-400 transition-colors">
                      <PixelIcon name={item.icon} size={32} />
                      <span className="absolute top-0.5 left-1 font-pixel text-[8px] text-stone-400 group-hover:text-amber-300">
                        {index + 1}
                      </span>
                    </Slot>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Footer Navigation Hints */}
          <div className="mt-4 pt-3 border-t border-stone-700 flex items-center justify-between text-xs font-pixelify text-stone-400">
            <span>Press <kbd className="px-1 border border-stone-600 bg-stone-800 text-stone-200">E</kbd> or <kbd className="px-1 border border-stone-600 bg-stone-800 text-stone-200">ESC</kbd> to close</span>
            <PixelButton variant="primary" className="text-xs py-1 px-3" onClick={closeInventoryModal}>
              Close
            </PixelButton>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}
