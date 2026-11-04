'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useToast } from './Toast';
import { playPixelSound } from '@/lib/pixel-sound';
import type { PixelIconName } from './pixel-icons';

export interface Advancement {
  id: string;
  title: string;
  description: string;
  icon: PixelIconName;
  unlockedAt?: number;
}

export const ALL_ADVANCEMENTS: Advancement[] = [
  {
    id: 'root',
    title: 'RoboLads World',
    description: 'Arrived at the HSGS RoboLads #31113 headquarters.',
    icon: 'star',
  },
  {
    id: 'story',
    title: 'Junior Recruit',
    description: 'Explored our team history and Onshape lab origins.',
    icon: 'compass',
  },
  {
    id: 'cad_lab',
    title: 'Master Craftsman',
    description: 'Inspected the 3D DecodeBot CAD Stage.',
    icon: 'gear',
  },
  {
    id: 'xray',
    title: 'X-Ray Vision',
    description: 'Engaged Wireframe inspection on the competition robot.',
    icon: 'wrench',
  },
  {
    id: 'explode',
    title: 'Disassembly Protocol',
    description: 'Exploded robot subsystem assemblies into individual components.',
    icon: 'wrench',
  },
  {
    id: 'quests',
    title: 'Quest Completed',
    description: 'Browsed our Core Activities on the Quest Board.',
    icon: 'sword',
  },
  {
    id: 'chest',
    title: 'Treasure Hunter',
    description: 'Opened the Engineering Resources repository catalog.',
    icon: 'chest',
  },
  {
    id: 'library',
    title: 'Team Scholar',
    description: 'Read the latest dispatches from the Team Blog.',
    icon: 'book',
  },
  {
    id: 'bedrock',
    title: 'Rock Bottom',
    description: 'Reached the bedrock layer at the foot of the page.',
    icon: 'pickaxe',
  },
  {
    id: 'inventory',
    title: 'Inventory Master',
    description: 'Opened the Quick Inventory equipment panel.',
    icon: 'chest',
  },
  {
    id: 'console',
    title: 'Terminal Hacker',
    description: 'Executed a terminal command in the Command Palette.',
    icon: 'redstone',
  },
  {
    id: 'konami',
    title: 'Secret Passcode',
    description: 'Entered the legendary Konami code! Cerberus unleashed.',
    icon: 'redstone',
  },
  {
    id: 'failure_log',
    title: 'Post-Mortem Logs',
    description: 'Turned engineering failures into progress by reading the post-mortem build logs.',
    icon: 'star',
  },
  {
    id: 'time_traveler',
    title: 'Time Traveler',
    description: 'Cycled the world lighting between Day, Sunset, and Night.',
    icon: 'compass',
  },
  {
    id: 'subsystems',
    title: 'Subsystem Master',
    description: 'Focused all 4 competition subsystems via 3D stage hotspots.',
    icon: 'gear',
  },
];

const STORAGE_KEY = 'robolads-advancements-v1';
const MUTE_STORAGE_KEY = 'robolads-toasts-muted';

interface AdvancementContextValue {
  advancements: Record<string, number>;
  unlock: (id: string) => boolean;
  isUnlocked: (id: string) => boolean;
  toastsMuted: boolean;
  setMuteToasts: (muted: boolean) => void;
  openAdvancementsModal: () => void;
  isAdvancementsModalOpen: boolean;
  closeAdvancementsModal: () => void;
  openInventoryModal: () => void;
  isInventoryModalOpen: boolean;
  closeInventoryModal: () => void;
  openCommandPalette: () => void;
  isCommandPaletteOpen: boolean;
  closeCommandPalette: () => void;
}

const AdvancementContext = createContext<AdvancementContextValue | null>(null);

export function AdvancementProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<Record<string, number>>({});
  const [toastsMuted, setToastsMuted] = useState(false);
  const [advancementsModalOpen, setAdvancementsModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const toastContext = useToast();

  // Load from localStorage safely
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUnlocked(JSON.parse(stored));
      }
      const muted = window.localStorage.getItem(MUTE_STORAGE_KEY);
      if (muted === 'true') {
        setToastsMuted(true);
      }
    } catch {
      // storage disabled
    }
  }, []);

  const unlock = useCallback(
    (id: string): boolean => {
      let newlyUnlocked = false;
      setUnlocked((prev) => {
        if (prev[id]) return prev;
        newlyUnlocked = true;
        const next = { ...prev, [id]: Date.now() };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // storage blocked
        }
        return next;
      });

      // Advancements system is removed/silent: do not trigger sound or toast popups
      return newlyUnlocked;
    },
    []
  );

  const isUnlocked = useCallback((id: string) => Boolean(unlocked[id]), [unlocked]);

  const setMuteToasts = useCallback((muted: boolean) => {
    setToastsMuted(muted);
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, []);

  return (
    <AdvancementContext.Provider
      value={{
        advancements: unlocked,
        unlock,
        isUnlocked,
        toastsMuted,
        setMuteToasts,
        openAdvancementsModal: () => {
          playPixelSound('open');
          setAdvancementsModalOpen(true);
        },
        isAdvancementsModalOpen: advancementsModalOpen,
        closeAdvancementsModal: () => {
          playPixelSound('close');
          setAdvancementsModalOpen(false);
        },
        openInventoryModal: () => {
          playPixelSound('open');
          setInventoryModalOpen(true);
        },
        isInventoryModalOpen: inventoryModalOpen,
        closeInventoryModal: () => {
          playPixelSound('close');
          setInventoryModalOpen(false);
        },
        openCommandPalette: () => {
          playPixelSound('open');
          setCommandPaletteOpen(true);
        },
        isCommandPaletteOpen: commandPaletteOpen,
        closeCommandPalette: () => {
          playPixelSound('close');
          setCommandPaletteOpen(false);
        },
      }}
    >
      {children}
    </AdvancementContext.Provider>
  );
}

export function useAdvancements() {
  const ctx = useContext(AdvancementContext);
  if (!ctx) {
    // Provide safe no-op fallback if used outside provider
    return {
      advancements: {},
      unlock: () => false,
      isUnlocked: () => false,
      toastsMuted: false,
      setMuteToasts: () => {},
      openAdvancementsModal: () => {},
      isAdvancementsModalOpen: false,
      closeAdvancementsModal: () => {},
      openInventoryModal: () => {},
      isInventoryModalOpen: false,
      closeInventoryModal: () => {},
      openCommandPalette: () => {},
      isCommandPaletteOpen: false,
      closeCommandPalette: () => {},
    };
  }
  return ctx;
}
