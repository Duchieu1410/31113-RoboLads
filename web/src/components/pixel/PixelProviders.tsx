'use client';

import React, { type ReactNode } from 'react';
import { ToastProvider } from './Toast';
import { AdvancementProvider } from './AdvancementContext';
import { AdvancementsModal } from './AdvancementsModal';
import { CommandPalette } from './CommandPalette';
import { InventoryModal } from './InventoryModal';
import { EasterEggs } from './EasterEggs';

export function PixelProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AdvancementProvider>
        {children}
        <CommandPalette />
        <InventoryModal />
        <EasterEggs />
      </AdvancementProvider>
    </ToastProvider>
  );
}
