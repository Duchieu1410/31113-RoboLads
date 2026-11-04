'use client';

import { useEffect } from 'react';
import { useAdvancements } from './AdvancementContext';

export function AdvancementTrigger({ id }: { id: string }) {
  const { unlock } = useAdvancements();

  useEffect(() => {
    const t = setTimeout(() => {
      unlock(id);
    }, 400);
    return () => clearTimeout(t);
  }, [id, unlock]);

  return null;
}
