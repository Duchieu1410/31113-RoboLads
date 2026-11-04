'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/routes';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { playPixelSound } from '@/lib/pixel-sound';
import { useWorldTheme } from '@/lib/useWorldTheme';
import { Mail, ArrowUpRight } from 'lucide-react';

export interface GlobalFooterProps extends React.HTMLAttributes<HTMLElement> {}

const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://www.facebook.com/robolads.hsgs' },
  { name: 'Instagram', href: 'https://www.instagram.com/hsgs.robolads' },
  { name: 'YouTube', href: 'https://www.youtube.com/@hsgsrobolads' },
  { name: 'GitHub', href: 'https://github.com/robolads' },
];

export const GlobalFooter = React.forwardRef<HTMLElement, GlobalFooterProps>(
  function GlobalFooter({ className = '', ...props }, ref) {
    const pathname = usePathname() || '/';
    const isHome = pathname === '/' || pathname === '';
    const { cycleTheme } = useWorldTheme();
    const [logoClicks, setLogoClicks] = useState(0);

    const handleLogoClick = () => {
      playPixelSound('click');
      const next = logoClicks + 1;
      setLogoClicks(next);
      if (next >= 5) {
        cycleTheme();
        setLogoClicks(0);
      }
    };

    const handleAnchorClick = (href: string) => {
      playPixelSound('click');
      if (isHome && href.includes('#')) {
        const targetId = href.split('#')[1];
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    return (
      <footer
        ref={ref}
        data-section="bedrock"
        className={`global-footer relative z-10 bg-[var(--bedrock)] border-t-2 border-stone-800 text-slate-300 py-10 px-6 sm:px-10 lg:px-12 mt-auto ${className}`}
        style={{ backgroundImage: 'var(--tex-bedrock)' }}
        {...props}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Main Top Row: Branding, Essential Navigation & Direct Contact */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-800/80">
            {/* Minimal Brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogoClick}
                className="cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
                title="HSGS RoboLads (FTC #31113)"
                aria-label="HSGS RoboLads Cerberus mascot logo."
              >
                <ImageWithFallback
                  src="/Photo/logo.png"
                  alt="HSGS RoboLads Logo"
                  className="h-9 w-auto object-contain"
                  fallbackTitle="31113"
                />
              </button>
              <div>
                <span className="font-display text-xs text-white block tracking-wider">
                  HSGS ROBOLADS
                </span>
                <span className="font-display text-[9px] text-amber-400 block mt-0.5">
                  FTC #31113 • HUS HIGH SCHOOL, HANOI
                </span>
              </div>
            </div>

            {/* Clean Essential Nav Links */}
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-display text-[10px] tracking-wider text-slate-400">
              <Link
                href="/#about-target"
                onClick={() => handleAnchorClick('/#about-target')}
                className="hover:text-amber-400 transition-colors"
              >
                ABOUT
              </Link>
              <Link
                href="/#activities-target"
                onClick={() => handleAnchorClick('/#activities-target')}
                className="hover:text-amber-400 transition-colors"
              >
                WHAT WE DO
              </Link>
              <Link
                href={ROUTES.CAD}
                onClick={() => playPixelSound('click')}
                className="hover:text-amber-400 transition-colors"
              >
                CAD LAB
              </Link>
              <Link
                href={ROUTES.RESOURCES}
                onClick={() => playPixelSound('click')}
                className="hover:text-amber-400 transition-colors"
              >
                RESOURCES
              </Link>
              <Link
                href={ROUTES.PORTFOLIOS}
                onClick={() => playPixelSound('click')}
                className="hover:text-amber-400 transition-colors"
              >
                PORTFOLIOS
              </Link>
              <Link
                href={ROUTES.BLOG}
                onClick={() => playPixelSound('click')}
                className="hover:text-amber-400 transition-colors"
              >
                BLOG
              </Link>
            </nav>

            {/* Direct Minimal Contact */}
            <a
              href="mailto:robolads.hsgs@gmail.com"
              onClick={() => playPixelSound('click')}
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-amber-400 transition-colors py-1.5 px-3 bg-stone-900/60 border border-stone-800 hover:border-amber-400/50"
              title="Contact HSGS RoboLads via email"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>robolads.hsgs@gmail.com</span>
            </a>
          </div>

          {/* Bottom Row: Minimal Social Links & Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-body">
            <div>
              &copy; {new Date().getFullYear()} HSGS ROBOLADS (FTC #31113). All rights reserved.
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs pr-16 sm:pr-20">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playPixelSound('click')}
                  className="hover:text-amber-400 text-slate-400 transition-colors flex items-center gap-1"
                >
                  <span>{item.name}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }
);
