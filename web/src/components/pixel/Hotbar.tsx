'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PixelIcon } from './PixelIcon';
import type { PixelIconName } from './pixel-icons';

export interface HotbarItem {
  /** DOM id of the section this slot jumps to. */
  id: string;
  label: string;
  icon: PixelIconName;
  href?: string;
}

export const DEFAULT_HOTBAR: HotbarItem[] = [
  { id: 'about-target', label: 'Story', icon: 'book', href: '/#about-target' },
  { id: 'activities-target', label: 'Activities', icon: 'gear', href: '/#activities-target' },
  { id: 'resources-target', label: 'Resources', icon: 'chest', href: '/resources' },
  { id: 'blog-target', label: 'Blog', icon: 'book', href: '/blog' },
];

interface HotbarProps {
  items?: HotbarItem[];
  /** Controlled active id (showcase). Otherwise it follows the section in view or route. */
  activeId?: string;
  /** Keys 1 to 5 jump to sections. */
  enableKeys?: boolean;
  /** Visual variant: 'compact' for top HUD command strip, 'default' for traditional inventory dock */
  variant?: 'default' | 'compact';
}

function isTyping(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/** Section nav with support for route awareness, keyboard shortcuts, and smooth scrolling. */
export function Hotbar({ items = DEFAULT_HOTBAR, activeId, enableKeys = true, variant = 'default' }: HotbarProps) {
  const [observed, setObserved] = useState<string | undefined>();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const isHome = pathname === '/' || pathname === '';

  // Determine active item based on controlled prop, pathname, or observed in-view section
  let active = activeId;
  if (!active) {
    if (pathname.startsWith('/resources')) {
      active = 'resources-target';
    } else if (pathname.startsWith('/blog')) {
      active = 'blog-target';
    } else if (isHome) {
      active = observed;
    }
  }

  // Observe in-view sections when on the homepage
  useEffect(() => {
    if (activeId || !isHome) return;
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setObserved(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -40% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items, activeId, isHome]);

  // Keyboard shortcut listener (Keys 1 to 4)
  useEffect(() => {
    if (!enableKeys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > items.length) return;
      const item = items[n - 1];

      if (isHome) {
        const el = document.getElementById(item.id);
        if (el) {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          return;
        }
      }

      if (item.href) {
        router.push(item.href);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, enableKeys, isHome, router]);

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, item: HotbarItem) => {
    if (isHome) {
      const el = document.getElementById(item.id);
      if (el) {
        e.preventDefault();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        return;
      }
    } else {
      if (item.href?.startsWith('/resources') && pathname.startsWith('/resources')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (item.href?.startsWith('/blog') && pathname.startsWith('/blog')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
  };

  if (variant === 'compact') {
    return (
      <nav aria-label="Page sections" className="px-hotbar-compact">
        {items.map((item, idx) => {
          const selected = active === item.id;
          const targetHref = isHome ? `#${item.id}` : (item.href || `/#${item.id}`);
          return (
            <Link
              key={item.id}
              href={targetHref}
              onClick={(e) => handleItemClick(e, item)}
              className={`px-hotbar-compact__item ${selected ? 'px-hotbar-compact__item--selected' : ''}`}
              aria-current={selected ? 'location' : undefined}
              aria-keyshortcuts={enableKeys ? String(idx + 1) : undefined}
            >
              <span className="px-hotbar-compact__key" aria-hidden="true">
                {idx + 1}
              </span>
              <span className="px-hotbar-compact__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Page sections" className="px-hotbar">
      {items.map((item, idx) => {
        const selected = active === item.id;
        const targetHref = isHome ? `#${item.id}` : (item.href || `/#${item.id}`);
        return (
          <Link
            key={item.id}
            href={targetHref}
            onClick={(e) => handleItemClick(e, item)}
            className="px-hotbar__item"
            aria-current={selected ? 'location' : undefined}
            aria-keyshortcuts={enableKeys ? String(idx + 1) : undefined}
          >
            <span className={`px-slot ${selected ? 'px-slot--selected' : ''}`.trim()} style={{ position: 'relative' }}>
              <span className="px-hotbar__key" aria-hidden="true">
                {idx + 1}
              </span>
              <PixelIcon name={item.icon} size={32} />
            </span>
            <span className="px-hotbar__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
