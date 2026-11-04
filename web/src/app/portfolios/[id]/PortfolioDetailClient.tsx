'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/routes';
import { BlockyHeader } from '@/components/BlockyHeader';
import { BlockyFooter } from '@/components/BlockyFooter';
import { PixelPanel, PixelButton, PixelIcon } from '@/components/pixel';
import { playPixelSound } from '@/lib/pixel-sound';
import type { FtcPortfolio } from '@/lib/portfolioTypes';
import {
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  Trophy,
  Award,
  Lightbulb,
  Cpu,
  Globe,
  Sparkles,
  Users,
  Wrench,
  ChevronRight,
  MapPin,
  School,
  Share2,
  Check,
} from 'lucide-react';

interface PortfolioDetailClientProps {
  portfolio: FtcPortfolio;
  allPortfolios: FtcPortfolio[];
  isUnderResources?: boolean;
}

export function PortfolioDetailClient({
  portfolio,
  allPortfolios,
  isUnderResources = false,
}: PortfolioDetailClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper to get award icons & badge colors
  const getAwardMeta = (type: string) => {
    switch (type) {
      case 'inspire':
        return {
          icon: <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          textColor: 'text-amber-300',
        };
      case 'think':
        return {
          icon: <Lightbulb className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
          textColor: 'text-purple-300',
        };
      case 'innovate':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          textColor: 'text-emerald-300',
        };
      case 'control':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
          textColor: 'text-sky-300',
        };
      case 'connect':
        return {
          icon: <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
          textColor: 'text-cyan-300',
        };
      default:
        return {
          icon: <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          textColor: 'text-amber-300',
        };
    }
  };

  // Helper to parse "Title: Description" for easier reading
  const parseBullet = (item: string) => {
    const colonIndex = item.indexOf(':');
    if (colonIndex > 0 && colonIndex < 60) {
      return {
        title: item.slice(0, colonIndex).trim(),
        description: item.slice(colonIndex + 1).trim(),
      };
    }
    return {
      title: null,
      description: item,
    };
  };

  const handleCopyLink = async () => {
    try {
      playPixelSound('click');
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  // Previous and next portfolio navigation
  const currentIndex = allPortfolios.findIndex((p) => p.id === portfolio.id);
  const prevPortfolio = currentIndex > 0 ? allPortfolios[currentIndex - 1] : null;
  const nextPortfolio =
    currentIndex >= 0 && currentIndex < allPortfolios.length - 1
      ? allPortfolios[currentIndex + 1]
      : null;

  return (
    <div className="proto-root landing-root flex flex-col min-h-screen">
      {/* 1. Global Navigation Header */}
      <BlockyHeader />

      {/* 2. Main Container */}
      <main id="main-content" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 block-page-enter">
        {/* Navigation / Breadcrumb Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-stone-800">
          <Link
            href={ROUTES.PORTFOLIOS}
            onClick={() => playPixelSound('click')}
            className="font-display text-[10px] text-slate-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>BACK TO PORTFOLIOS</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="font-display text-[9px] px-3 py-1.5 bg-stone-900 border border-stone-700 text-slate-300 hover:text-amber-300 hover:border-amber-400 flex items-center gap-1.5 shadow-[2px_2px_0_#000000] cursor-pointer transition-colors"
              title="Copy page link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">COPIED</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Simplistic Team Header */}
        <div className="mb-8 p-6 sm:p-8 bg-stone-900 border-2 border-stone-700 shadow-[4px_4px_0_#000000]">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-stone-950 font-display text-xs font-bold shadow-[2px_2px_0_#000000]">
                  <PixelIcon name="gear" size={16} />
                  <span>FTC #{portfolio.teamNumber}</span>
                </span>

                <span className="portfolio-season-pill font-display text-[9px] px-2.5 py-1 border shadow-[1px_1px_0_#000000]">
                  {portfolio.season}
                </span>

                {portfolio.teamNumber === '7444' && (
                  <span className="portfolio-sample-pill font-display text-[9px] px-2.5 py-1 border shadow-[1px_1px_0_#000000]">
                    ★ BENCHMARK
                  </span>
                )}
                {portfolio.teamNumber === '31113' && (
                  <span className="portfolio-host-pill font-display text-[9px] px-2.5 py-1 border shadow-[1px_1px_0_#000000]">
                    ★ HOST TEAM
                  </span>
                )}
              </div>

              {/* Team Name */}
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide mb-2">
                {portfolio.teamName}
              </h1>

              {/* Affiliation & Location */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs sm:text-sm text-slate-300 font-body">
                <span className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{portfolio.schoolOrOrg}</span>
                </span>
                <span className="text-stone-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{portfolio.location}</span>
                </span>
              </div>

              {/* Awards Won (Clean, Compact Badges) */}
              {portfolio.awards && portfolio.awards.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {portfolio.awards.map((award, index) => {
                    const meta = getAwardMeta(award.type);
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-950/80 border border-stone-700 text-xs shadow-[1px_1px_0_#000000]"
                      >
                        {meta.icon}
                        <span className={`font-semibold ${meta.textColor}`}>{award.name}</span>
                        {award.level && (
                          <span className="text-[10px] text-slate-400 border-l border-stone-700 pl-1.5">
                            {award.level}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-stretch gap-2 shrink-0">
              <a
                href={portfolio.pdfUrl}
                download
                onClick={() => playPixelSound('click')}
                className="px-4 py-2.5 bg-amber-400 text-stone-950 font-display text-xs font-bold uppercase tracking-wider border-2 border-stone-900 hover:bg-amber-300 flex items-center justify-center gap-2 shadow-[2px_2px_0_#000000] cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD PDF</span>
              </a>

              <a
                href={portfolio.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-stone-950 text-slate-200 font-display text-[10px] uppercase tracking-wider border-2 border-stone-700 hover:border-amber-400 hover:text-amber-300 flex items-center justify-center gap-1.5 shadow-[2px_2px_0_#000000] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>OPEN IN NEW TAB</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4. Team Summary Section */}
        <div className="mb-8 p-6 sm:p-8 bg-stone-900 border-2 border-stone-700 shadow-[4px_4px_0_#000000]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-800">
            <PixelIcon name="star" size={16} />
            <h2 className="font-heading text-lg sm:text-xl text-white tracking-wide">
              SUMMARY
            </h2>
          </div>

          <p className="font-body text-base sm:text-lg text-slate-200 leading-relaxed max-w-4xl">
            {portfolio.summary?.overview ||
              `Official engineering portfolio of FTC #${portfolio.teamNumber} ${portfolio.teamName} for the ${portfolio.season} season.`}
          </p>

          {/* Key Mechanisms */}
          {portfolio.notableMechanisms && portfolio.notableMechanisms.length > 0 && (
            <div className="mt-5 pt-4 border-t border-stone-800">
              <span className="font-display text-[9px] text-amber-400 uppercase tracking-wider block mb-2">
                KEY MECHANISMS:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {portfolio.notableMechanisms.map((mech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-stone-950 border border-stone-700 text-slate-200 text-xs font-mono shadow-[1px_1px_0_#000000]"
                  >
                    ⚙️ {mech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. In-Page PDF Reader (Directly under Summary!) */}
        <div id="pdf-viewer" className="mb-10">
          <div className="p-4 bg-stone-900 border-2 border-b-0 border-stone-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h3 className="font-heading text-sm sm:text-base text-white tracking-wide">
                ENGINEERING PORTFOLIO (PDF)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={portfolio.pdfUrl}
                download
                onClick={() => playPixelSound('click')}
                className="font-display text-[9px] px-3 py-1.5 bg-stone-950 border border-stone-700 text-slate-300 hover:text-amber-300 hover:border-amber-400 flex items-center gap-1.5 shadow-[2px_2px_0_#000000] transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>DOWNLOAD</span>
              </a>

              <a
                href={portfolio.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-[9px] px-3 py-1.5 bg-amber-400 text-stone-950 font-bold border border-amber-300 hover:bg-amber-300 flex items-center gap-1.5 shadow-[2px_2px_0_#000000] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>FULLSCREEN</span>
              </a>
            </div>
          </div>

          {/* Embedded PDF iframe */}
          <div className="w-full h-[650px] sm:h-[820px] bg-stone-950 border-2 border-stone-700 shadow-[4px_4px_0_#000000] overflow-hidden">
            <iframe
              src={`${portfolio.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title={`FTC #${portfolio.teamNumber} ${portfolio.teamName} Engineering Portfolio`}
              className="w-full h-full border-none"
            />
          </div>
          <p className="mt-2 text-xs font-mono text-slate-400 text-center">
            Tip: If the viewer doesn't load on mobile,{' '}
            <a href={portfolio.pdfUrl} download className="text-amber-400 hover:underline">
              click here to download the PDF
            </a>
            .
          </p>
        </div>

        {/* 6. Section Breakdowns: Clean & Simplistic */}
        <div className="space-y-8 mb-12">
          {/* Mechanical Subsystems & CAD */}
          {portfolio.summary?.technical && portfolio.summary.technical.length > 0 && (
            <div className="p-6 sm:p-8 bg-stone-900 border-2 border-stone-700 shadow-[4px_4px_0_#000000]">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-stone-800">
                <div className="p-1.5 bg-amber-400 text-stone-950 shadow-[1px_1px_0_#000000]">
                  <Wrench className="w-4 h-4" />
                </div>
                <h2 className="font-heading text-lg sm:text-xl text-white tracking-wide">
                  MECHANICAL SUBSYSTEMS &amp; <span className="text-amber-400">CAD</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.summary.technical.map((item, idx) => {
                  const { title, description } = parseBullet(item);
                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 bg-stone-950/80 border-2 border-stone-800 hover:border-amber-400/50 transition-colors shadow-[2px_2px_0_#000000]"
                    >
                      {title && (
                        <h3 className="font-heading text-sm sm:text-base text-white mb-1.5 leading-snug">
                          {title}
                        </h3>
                      )}
                      <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Autonomous & Software */}
          {portfolio.summary?.software && portfolio.summary.software.length > 0 && (
            <div className="p-6 sm:p-8 bg-stone-900 border-2 border-stone-700 shadow-[4px_4px_0_#000000]">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-stone-800">
                <div className="p-1.5 bg-sky-400 text-stone-950 shadow-[1px_1px_0_#000000]">
                  <Cpu className="w-4 h-4" />
                </div>
                <h2 className="font-heading text-lg sm:text-xl text-white tracking-wide">
                  AUTONOMOUS &amp; <span className="text-sky-400">SOFTWARE</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.summary.software.map((item, idx) => {
                  const { title, description } = parseBullet(item);
                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 bg-stone-950/80 border-2 border-stone-800 hover:border-sky-400/50 transition-colors shadow-[2px_2px_0_#000000]"
                    >
                      {title && (
                        <h3 className="font-heading text-sm sm:text-base text-white mb-1.5 leading-snug">
                          {title}
                        </h3>
                      )}
                      <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Community Outreach */}
          {portfolio.summary?.outreach && portfolio.summary.outreach.length > 0 && (
            <div className="p-6 sm:p-8 bg-stone-900 border-2 border-stone-700 shadow-[4px_4px_0_#000000]">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-stone-800">
                <div className="p-1.5 bg-emerald-400 text-stone-950 shadow-[1px_1px_0_#000000]">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="font-heading text-lg sm:text-xl text-white tracking-wide">
                  COMMUNITY OUTREACH &amp; <span className="text-emerald-400">IMPACT</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.summary.outreach.map((item, idx) => {
                  const { title, description } = parseBullet(item);
                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 bg-stone-950/80 border-2 border-stone-800 hover:border-emerald-400/50 transition-colors shadow-[2px_2px_0_#000000]"
                    >
                      {title && (
                        <h3 className="font-heading text-sm sm:text-base text-white mb-1.5 leading-snug">
                          {title}
                        </h3>
                      )}
                      <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 7. Next / Previous Navigation */}
        <div className="pt-6 border-t-2 border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPortfolio ? (
            <Link
              href={ROUTES.PORTFOLIO_DETAIL(prevPortfolio.id)}
              onClick={() => playPixelSound('click')}
              className="p-4 bg-stone-900 border-2 border-stone-700 hover:border-amber-400 text-left transition-all shadow-[2px_2px_0_#000000] flex items-center gap-3 group"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform shrink-0" />
              <div>
                <span className="font-display text-[9px] text-slate-400 uppercase tracking-wider block">
                  PREVIOUS
                </span>
                <span className="font-heading text-sm text-white group-hover:text-amber-300 transition-colors">
                  FTC #{prevPortfolio.teamNumber} {prevPortfolio.teamName}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextPortfolio && (
            <Link
              href={ROUTES.PORTFOLIO_DETAIL(nextPortfolio.id)}
              onClick={() => playPixelSound('click')}
              className="p-4 bg-stone-900 border-2 border-stone-700 hover:border-amber-400 text-right transition-all shadow-[2px_2px_0_#000000] flex items-center justify-end gap-3 group ml-auto w-full"
            >
              <div>
                <span className="font-display text-[9px] text-slate-400 uppercase tracking-wider block">
                  NEXT
                </span>
                <span className="font-heading text-sm text-white group-hover:text-amber-300 transition-colors">
                  FTC #{nextPortfolio.teamNumber} {nextPortfolio.teamName}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          )}
        </div>
      </main>

      {/* 8. Global Footer */}
      <BlockyFooter />
    </div>
  );
}
