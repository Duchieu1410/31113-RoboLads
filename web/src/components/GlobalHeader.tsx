'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/routes';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { SoundToggle } from '@/components/pixel/SoundToggle';
import { PixelIcon } from '@/components/pixel/PixelIcon';
import { useWorldTheme } from '@/lib/useWorldTheme';
import { useAdvancements } from '@/components/pixel/AdvancementContext';
import { playPixelSound } from '@/lib/pixel-sound';
import { Sun, Moon, Sunset } from 'lucide-react';

export interface GlobalHeaderProps {
  /** Optional manual section override for homepage anchor tracking */
  activeSection?: string;
  /** Legacy prop for backward compatibility */
  showBackToHome?: boolean;
}

interface MainNavItem {
  label: string;
  href: string;
  targetId?: string;
  isAnchor: boolean;
  dropdown?: Array<{
    label: string;
    href: string;
    icon: 'chest' | 'star';
    desc: string;
  }>;
}

const MAIN_NAV: MainNavItem[] = [
  { label: 'ABOUT US', href: '/#about-target', targetId: 'about-target', isAnchor: true },
  { label: 'WHAT WE DO', href: '/#activities-target', targetId: 'activities-target', isAnchor: true },
  { label: 'CAD LAB', href: ROUTES.CAD, isAnchor: false },
  {
    label: 'RESOURCES',
    href: ROUTES.RESOURCES,
    isAnchor: false,
    dropdown: [
      {
        label: 'ENGINEERING ASSETS',
        href: ROUTES.RESOURCES,
        icon: 'chest',
        desc: 'CAD schematics, code & failure logs',
      },
      {
        label: 'FTC PORTFOLIO HUB',
        href: ROUTES.PORTFOLIOS,
        icon: 'star',
        desc: '15-page FTC portfolios & awards',
      },
    ],
  },
  { label: 'BLOG', href: ROUTES.BLOG, isAnchor: false },
];

export function GlobalHeader({ activeSection: controlledActiveSection }: GlobalHeaderProps = {}) {
  const pathname = usePathname() || '/';
  const isHome = pathname === '/' || pathname === '';
  const { theme, cycleTheme, switchTheme } = useWorldTheme();
  const { openInventoryModal } = useAdvancements();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [observedSection, setObservedSection] = useState<string | undefined>();

  const activeSection = controlledActiveSection ?? observedSection;

  // Track page scroll percentage for XP bar
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  // On homepage: observe visible sections to highlight navbar & hotbar
  useEffect(() => {
    if (!isHome) return;

    const targetIds = ['about-target', 'activities-target', 'resources-target', 'blog-target'];
    const elements = targetIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setObservedSection(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -35% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  // Smooth scroll handler for anchor links
  const handleAnchorClick = useCallback(
    (e: React.MouseEvent, targetId: string) => {
      if (isHome) {
        const el = document.getElementById(targetId);
        if (el) {
          e.preventDefault();
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
      }
    },
    [isHome]
  );

  // Easter egg: 5 rapid logo clicks cycles theme
  const handleLogoClick = useCallback(() => {
    try {
      playPixelSound('click');
    } catch {}
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        cycleTheme();
        return 0;
      }
      return next;
    });
  }, [cycleTheme]);


  return (
    <header className="global-header sticky top-0 z-50 w-full" id="global-header">
      {/* =====================================================================
          TIER 1: MAIN NAVIGATION BAR (STICKY PRIMARY)
          ===================================================================== */}
      <div className="landing-navbar">
        {/* Brand Identity with Cerberus Logo */}
        <div className="landing-navbar-logo flex items-center gap-3 group">
          <button
            type="button"
            onClick={handleLogoClick}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-400"
            title="Cerberus mascot logo. Click 5 times to cycle world time!"
            aria-label="HSGS RoboLads Cerberus mascot logo. Click 5 times to cycle world time."
          >
            <ImageWithFallback
              src="/Photo/logo.png"
              alt="HSGS RoboLads Logo"
              className="h-10 w-auto"
              fallbackTitle="31113 ROBOLADS"
            />
          </button>
          <Link href={ROUTES.HOME} className="hidden sm:block">
            <span className="font-pixel text-[11px] text-white group-hover:text-amber-400 transition-colors block">
              HSGS ROBOLADS
            </span>
            <span className="font-pixel text-[8px] text-amber-400 block mt-0.5">
              FTC #31113
            </span>
          </Link>
        </div>

        {/* Mobile Controls: Vibe quick-toggle + Sound toggle + Hamburger */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <button
            type="button"
            onClick={cycleTheme}
            className="landing-theme-toggle"
            title={`Current theme: ${theme.toUpperCase()} (click to cycle)`}
            aria-label={`Toggle theme: currently ${theme}`}
          >
            {theme === 'day' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'sunset' ? (
              <Sunset className="w-4 h-4 text-orange-400" />
            ) : (
              <Moon className="w-4 h-4 text-amber-300" />
            )}
          </button>
          <SoundToggle variant="compact" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="landing-nav-toggle"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Menu navigation'}
          >
            {mobileMenuOpen ? '✕ CLOSE' : '☰ MENU'}
          </button>
        </div>

        {/* Desktop Menu */}
        <nav className="landing-navbar-menu" aria-label="Primary Navigation">
          {MAIN_NAV.map((item) => {
            const isAnchorActive = isHome && activeSection === item.targetId;
            const isRouteActive =
              (item.href === ROUTES.CAD && pathname === ROUTES.CAD) ||
              (item.href === ROUTES.RESOURCES && (pathname.startsWith(ROUTES.RESOURCES) || pathname.startsWith(ROUTES.PORTFOLIOS))) ||
              (item.href === ROUTES.BLOG && pathname.startsWith(ROUTES.BLOG));

            const isActive = isAnchorActive || isRouteActive;

            if (item.dropdown) {
              return (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => playPixelSound('click')}
                    className={`landing-nav-btn cursor-pointer flex items-center gap-1.5 ${
                      isActive ? 'landing-nav-btn--active is-active font-bold' : ''
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[8px] opacity-70 group-hover:translate-y-0.5 transition-transform">▼</span>
                  </Link>

                  {/* Dropdown panel */}
                  <div className="absolute top-full left-0 pt-1.5 hidden group-hover:block group-focus-within:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="w-64 bg-[#0e1023] border-2 border-stone-700 shadow-[4px_4px_0_#000000] p-1.5 flex flex-col gap-1 dropdown-panel">
                      {item.dropdown.map((sub) => {
                        const isSubActive =
                          pathname === sub.href ||
                          (sub.href === ROUTES.PORTFOLIOS && (pathname.startsWith(ROUTES.PORTFOLIOS) || pathname.includes('portfolios'))) ||
                          (sub.href === ROUTES.RESOURCES && pathname.startsWith(ROUTES.RESOURCES) && !pathname.includes('portfolios'));

                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={() => playPixelSound('click')}
                            className={`p-2.5 flex items-start gap-2.5 border transition-all ${
                              isSubActive
                                ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-[2px_2px_0_#000000]'
                                : 'bg-[#050610] text-slate-200 border-stone-800 hover:border-amber-400 hover:text-amber-300 hover:bg-[#121633]'
                            }`}
                          >
                            <PixelIcon name={sub.icon} size={16} />
                            <div className="flex-1 min-w-0">
                              <span className="font-display text-[10px] block tracking-wide">
                                {sub.label}
                              </span>
                              <span
                                className={`text-[9px] font-body block leading-tight mt-0.5 ${
                                  isSubActive ? 'text-stone-900 font-medium' : 'text-slate-400'
                                }`}
                              >
                                {sub.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.isAnchor && item.targetId) {
                    handleAnchorClick(e, item.targetId);
                  }
                }}
                className={`landing-nav-btn cursor-pointer ${
                  isActive ? 'landing-nav-btn--active is-active font-bold' : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Minimalist World Vibe Toggle (Day ☀️ -> Sunset 🌅 -> Night 🌙) */}
          <button
            type="button"
            onClick={cycleTheme}
            className="landing-theme-toggle ml-1"
            title={`Current theme: ${theme.toUpperCase()} (click to cycle)`}
            aria-label={`Toggle theme: currently ${theme}`}
          >
            {theme === 'day' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'sunset' ? (
              <Sunset className="w-4 h-4 text-orange-400" />
            ) : (
              <Moon className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {/* Desktop Game Layer Controls */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-stone-700">
            <SoundToggle variant="compact" />
            <button
              type="button"
              onClick={openInventoryModal}
              className="px-panel px-panel--stone p-1.5 flex items-center gap-1 text-[9px] font-pixel text-slate-300 hover:text-amber-300 cursor-pointer transition-colors"
              aria-label="INV [E] - Open inventory dialog"
              title="Player Inventory [E]"
            >
              <PixelIcon name="chest" size={16} />
              <span>INV [E]</span>
            </button>
          </div>
        </nav>
      </div>


      {/* =====================================================================
          MOBILE DRAWER OVERLAY
          Opens cleanly below header on tablet/mobile screens
          ===================================================================== */}
      {mobileMenuOpen && (
        <div className="absolute top-full inset-x-0 z-40 bg-[#08081a]/98 backdrop-blur-md border-b-4 border-amber-400 p-6 flex flex-col gap-3 font-pixel text-xs overflow-y-auto max-h-[calc(100vh-100%)] shadow-[0_12px_24px_rgba(0,0,0,0.8)] mobile-drawer-enter">
          {MAIN_NAV.map((item) => (
            <React.Fragment key={item.label}>
              <Link
                href={item.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (item.isAnchor && item.targetId) {
                    handleAnchorClick(e, item.targetId);
                  }
                }}
                className="w-full p-3.5 bg-stone-900 border-2 border-stone-700 text-white hover:text-amber-400 hover:border-amber-400 flex items-center justify-between block-filter-btn font-display text-xs"
              >
                <span>{item.label}</span>
                {item.dropdown && <span className="text-[10px] text-amber-400">▾</span>}
              </Link>
              {item.dropdown && (
                <div className="pl-3 -mt-1.5 flex flex-col gap-1.5">
                  {item.dropdown.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 bg-stone-950 border border-stone-800 text-slate-300 hover:text-amber-300 hover:border-amber-400/50 flex items-center gap-2 font-display text-[10px]"
                    >
                      <PixelIcon name={sub.icon} size={16} />
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Mobile Drawer Vibe Switcher */}
          <div className="p-3 bg-stone-900 border-2 border-stone-700 flex items-center justify-between">
            <span className="font-display text-[10px] text-amber-400">THEME</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  switchTheme('day');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 border cursor-pointer flex items-center justify-center ${
                  theme === 'day'
                    ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold'
                    : 'bg-stone-800 text-stone-300 border-stone-600'
                }`}
                title="Day Mode"
                aria-label="Day Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  switchTheme('sunset');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 border cursor-pointer flex items-center justify-center ${
                  theme === 'sunset'
                    ? 'bg-orange-500 text-white border-orange-400 font-bold'
                    : 'bg-stone-800 text-stone-300 border-stone-600'
                }`}
                title="Sunset Mode"
                aria-label="Sunset Mode"
              >
                <Sunset className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  switchTheme('night');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 border cursor-pointer flex items-center justify-center ${
                  theme === 'night'
                    ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold'
                    : 'bg-stone-800 text-stone-300 border-stone-600'
                }`}
                title="Night Mode"
                aria-label="Night Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Drawer Game Layer Controls */}
          <div className="pt-2 border-t-2 border-stone-800 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openInventoryModal();
              }}
              className="flex-1 p-3 bg-stone-900 border-2 border-stone-700 text-stone-200 hover:border-amber-400 flex items-center justify-center gap-2 font-display text-xs cursor-pointer"
            >
              <PixelIcon name="chest" size={16} />
              <span>INVENTORY [E]</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
