'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/routes';
import { BlockyHeader } from '@/components/BlockyHeader';
import { BlockyFooter } from '@/components/BlockyFooter';
import { PixelPanel, PixelButton, PixelIcon } from '@/components/pixel';
import { playPixelSound } from '@/lib/pixel-sound';
import { FTC_PORTFOLIOS, type FtcPortfolio } from '@/lib/portfolioData';
import {
  Search,
  X,
  FileText,
  Download,
  ExternalLink,
  Eye,
  Trophy,
  Award,
  Lightbulb,
  Cpu,
  Globe,
  Sparkles,
  Users,
  Wrench,
  CheckCircle2,
  Layers,
  ChevronRight,
} from 'lucide-react';

const SEASONS = [
  { id: 'ALL', label: 'ALL SEASONS' },
  { id: 'Decode', label: 'DECODE (2025-26)' },
  { id: 'CenterStage', label: 'CENTERSTAGE (2023-24)' },
  { id: 'PowerPlay', label: 'POWERPLAY (2022-23)' },
  { id: 'Ultimate Goal', label: 'ULTIMATE GOAL (2020-21)' },
];

const AWARD_FILTERS = [
  { id: 'ALL', label: 'ALL AWARDS' },
  { id: 'inspire', label: 'INSPIRE WINNER' },
  { id: 'think', label: 'THINK AWARD' },
  { id: 'innovate', label: 'INNOVATE AWARD' },
  { id: 'control', label: 'CONTROL AWARD' },
  { id: 'connect', label: 'CONNECT AWARD' },
];

type SummaryTab = 'outreach' | 'technical' | 'software' | 'overview';

export interface PortfoliosClientProps {
  initialPortfolios?: FtcPortfolio[];
  isUnderResources?: boolean;
}

export function PortfoliosClient({
  initialPortfolios,
  isUnderResources = false,
}: PortfoliosClientProps = {}) {
  const portfolios = useMemo(() => {
    return initialPortfolios && initialPortfolios.length > 0 ? initialPortfolios : FTC_PORTFOLIOS;
  }, [initialPortfolios]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('ALL');
  const [selectedAward, setSelectedAward] = useState('ALL');
  const [activeTabs, setActiveTabs] = useState<Record<string, SummaryTab>>({});
  const [previewPortfolio, setPreviewPortfolio] = useState<FtcPortfolio | null>(null);

  // Dynamically compute available seasons from actual backend records
  const availableSeasons = useMemo(() => {
    const set = new Set<string>();
    portfolios.forEach((p) => {
      if (p.season) set.add(p.season);
    });
    return ['ALL', ...Array.from(set)];
  }, [portfolios]);

  // Dynamically compute available awards from actual backend records
  const availableAwards = useMemo(() => {
    const types = new Set<string>();
    portfolios.forEach((p) => {
      p.awards?.forEach((a) => types.add(a.type));
    });
    const result = [{ id: 'ALL', label: 'ALL AWARDS' }];
    AWARD_FILTERS.forEach((a) => {
      if (a.id !== 'ALL' && types.has(a.id)) {
        result.push(a);
      }
    });
    return result;
  }, [portfolios]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewPortfolio) {
        setPreviewPortfolio(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPortfolio]);

  // Filter portfolios
  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      // Season filter
      if (selectedSeason !== 'ALL' && p.season !== selectedSeason) {
        return false;
      }

      // Award filter
      if (selectedAward !== 'ALL') {
        const hasAward = p.awards?.some((a) => a.type === selectedAward);
        if (!hasAward) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTeam =
          p.teamNumber.toLowerCase().includes(q) ||
          p.teamName.toLowerCase().includes(q) ||
          p.schoolOrOrg.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q);
        const matchesAwards = p.awards?.some((a) => a.name.toLowerCase().includes(q));
        const matchesMechanisms = p.notableMechanisms?.some((m) => m.toLowerCase().includes(q));
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesOverview = p.summary?.overview?.toLowerCase().includes(q);

        if (!matchesTeam && !matchesAwards && !matchesMechanisms && !matchesTags && !matchesOverview) {
          return false;
        }
      }

      return true;
    });
  }, [portfolios, selectedSeason, selectedAward, searchQuery]);

  const handleTabChange = (portfolioId: string, tab: SummaryTab) => {
    try {
      playPixelSound('click');
    } catch {}
    setActiveTabs((prev) => ({ ...prev, [portfolioId]: tab }));
  };

  const getActiveTab = (portfolioId: string): SummaryTab => {
    return activeTabs[portfolioId] || 'overview';
  };

  const getAwardIcon = (type: string) => {
    switch (type) {
      case 'inspire':
        return <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'think':
        return <Lightbulb className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'innovate':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'control':
        return <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'connect':
        return <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      default:
        return <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
  };

  const clearFilters = () => {
    try {
      playPixelSound('click');
    } catch {}
    setSearchQuery('');
    setSelectedSeason('ALL');
    setSelectedAward('ALL');
  };

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

  return (
    <div className="proto-root landing-root flex flex-col min-h-screen">
      {/* 1. Global Header */}
      <BlockyHeader />

      {/* 2. Main Content Container */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 block-page-enter">
        {/* Navigation Tabs between Engineering Assets and Portfolios */}
        <div className="mb-8 flex items-center gap-2 border-b-2 border-stone-800 pb-3">
          <Link
            href={ROUTES.RESOURCES}
            onClick={() => playPixelSound('click')}
            className="font-display text-[10px] sm:text-xs px-4 py-2 border-2 bg-stone-900 text-slate-300 border-stone-700 hover:border-amber-400 hover:text-amber-300 flex items-center gap-2 transition-all shadow-[2px_2px_0_#000000]"
          >
            <PixelIcon name="chest" size={16} />
            <span>ENGINEERING ASSETS &amp; CAD</span>
          </Link>
          <div className="font-display text-[10px] sm:text-xs px-4 py-2 border-2 bg-amber-400 text-stone-950 font-bold border-amber-300 flex items-center gap-2 shadow-[2px_2px_0_#000000] translate-y-[-1px]">
            <PixelIcon name="star" size={16} />
            <span>FTC ENGINEERING PORTFOLIOS</span>
          </div>
        </div>

        {/* Title & Hub Banner */}
        <div className="mb-8 pb-6 border-b-2 border-stone-800">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h1 className="font-heading text-2xl sm:text-3xl text-white tracking-wide">
              FTC ENGINEERING <span className="text-amber-400">PORTFOLIOS</span>
            </h1>
            <div className="font-mono text-xs text-slate-400">
              {filteredPortfolios.length} {filteredPortfolios.length === 1 ? 'Portfolio' : 'Portfolios'}
            </div>
          </div>
          <p className="text-sm text-slate-300 max-w-3xl font-body leading-relaxed">
            Curated engineering portfolios and documentation from FIRST Tech Challenge teams.
          </p>
        </div>

        {/* 3. Search & Filtering Controls */}
        <div className="mb-8 flex flex-col gap-5">
          {/* Live Search Bar */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team number, team name, awards, mechanisms (e.g. 7444, lead screw, inspire)..."
              className="w-full pl-10 pr-10 py-3 bg-stone-900 border-2 border-stone-700 text-white font-body text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-[3px_3px_0_#000000] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-400"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Row: Seasons & Award Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Season Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-display text-[9px] text-slate-400 mr-1 uppercase tracking-wider">Season:</span>
              {availableSeasons.map((s) => {
                const isSelected = selectedSeason === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      try {
                        playPixelSound('click');
                      } catch {}
                      setSelectedSeason(s);
                    }}
                    className={`font-display text-[9px] px-3 py-1.5 uppercase tracking-wider border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-[2px_2px_0_#000000]'
                        : 'bg-stone-900 text-slate-300 border-stone-700 hover:border-amber-400 hover:text-amber-300 shadow-[2px_2px_0_#000000]'
                    }`}
                  >
                    {s === 'ALL' ? 'ALL SEASONS' : s}
                  </button>
                );
              })}
            </div>

            {/* Award Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-display text-[9px] text-slate-400 mr-1 uppercase tracking-wider">Award:</span>
              {availableAwards.map((a) => {
                const isSelected = selectedAward === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      try {
                        playPixelSound('click');
                      } catch {}
                      setSelectedAward(a.id);
                    }}
                    className={`font-display text-[9px] px-3 py-1.5 uppercase tracking-wider border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-[2px_2px_0_#000000]'
                        : 'bg-stone-900 text-slate-300 border-stone-700 hover:border-amber-400 hover:text-amber-300 shadow-[2px_2px_0_#000000]'
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}

              {(selectedSeason !== 'ALL' || selectedAward !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-display text-[9px] px-2.5 py-1.5 bg-red-950/80 border-2 border-red-500/50 text-red-300 hover:border-red-400 hover:text-red-200 flex items-center gap-1 shadow-[2px_2px_0_#000000] cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Portfolios Grid */}
        <div className="grid grid-cols-1 gap-8">
          {filteredPortfolios.map((portfolio) => {
            const currentTab = getActiveTab(portfolio.id);

            return (
              <PixelPanel
                key={portfolio.id}
                variant="stone"
                className="p-6 sm:p-8 flex flex-col justify-between border-2 border-stone-700 hover:border-amber-400/80 transition-all shadow-[4px_4px_0_#000000]"
              >
                <div>
                  {/* Card Header: Team Badge, Name, Location & File Tag */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        {/* Team Number Pixel Pill */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-stone-950 font-display text-xs font-bold shadow-[2px_2px_0_#000000]">
                          <PixelIcon name="gear" size={16} />
                          <span>FTC #{portfolio.teamNumber}</span>
                        </div>

                        {/* Season Tag */}
                        <span className="portfolio-season-pill font-display text-[9px] px-2.5 py-1 border shadow-[1px_1px_0_#000000]">
                          {portfolio.season}
                        </span>

                        {/* Benchmark badge for sample from prompt */}
                        {portfolio.teamNumber === '7444' && (
                          <span className="portfolio-sample-pill font-display text-[9px] px-2.5 py-1 border shadow-[1px_1px_0_#000000]">
                            ★ OFFICIAL SAMPLE PORTFOLIO
                          </span>
                        )}
                        {portfolio.teamNumber === '31113' && (
                          <span className="portfolio-host-pill font-display text-[9px] px-2.5 py-1 border shadow-[1px_1px_0_#000000]">
                            ★ HOST TEAM PORTFOLIO
                          </span>
                        )}
                      </div>

                      <Link
                        href={ROUTES.PORTFOLIO_DETAIL(portfolio.id)}
                        onClick={() => playPixelSound('click')}
                        className="group inline-block"
                      >
                        <h2 className="font-heading text-xl sm:text-2xl text-white group-hover:text-amber-400 transition-colors tracking-wide flex items-center gap-2">
                          <span>{portfolio.teamName}</span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-amber-400" />
                        </h2>
                      </Link>
                      <p className="font-body text-xs sm:text-sm text-slate-300 mt-1">
                        {portfolio.schoolOrOrg} • {portfolio.location}
                      </p>
                    </div>
                  </div>

                  {/* Awards */}
                  {portfolio.awards && portfolio.awards.length > 0 && (
                    <div className="my-4 flex flex-wrap items-center gap-2">
                      {portfolio.awards.map((award, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900/90 border border-stone-700 text-xs font-body text-slate-200 shadow-[1px_1px_0_#000000]"
                        >
                          {getAwardIcon(award.type)}
                          <span className="font-medium text-amber-300">{award.name}</span>
                          {award.level && (
                            <span className="text-[10px] text-slate-400 border-l border-stone-700 pl-1.5">
                              {award.level}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Executive Summary Section */}
                  <div className="my-5 p-4 sm:p-5 bg-stone-950/80 border-2 border-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-800">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span className="font-display text-[10px] text-amber-400 uppercase tracking-wider font-bold">
                          SUMMARY
                        </span>
                      </div>

                      {/* Interactive Tab Selector */}
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTabChange(portfolio.id, 'overview')}
                          className={`font-display text-[9px] px-2.5 py-1 uppercase tracking-wider border cursor-pointer transition-colors ${
                            currentTab === 'overview'
                              ? 'bg-amber-400 text-stone-950 font-bold border-amber-300'
                              : 'bg-stone-900 text-slate-300 border-stone-700 hover:text-amber-300'
                          }`}
                        >
                          OVERVIEW
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTabChange(portfolio.id, 'outreach')}
                          className={`font-display text-[9px] px-2.5 py-1 uppercase tracking-wider border cursor-pointer transition-colors ${
                            currentTab === 'outreach'
                              ? 'bg-amber-400 text-stone-950 font-bold border-amber-300'
                              : 'bg-stone-900 text-slate-300 border-stone-700 hover:text-amber-300'
                          }`}
                        >
                          OUTREACH
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTabChange(portfolio.id, 'technical')}
                          className={`font-display text-[9px] px-2.5 py-1 uppercase tracking-wider border cursor-pointer transition-colors ${
                            currentTab === 'technical'
                              ? 'bg-amber-400 text-stone-950 font-bold border-amber-300'
                              : 'bg-stone-900 text-slate-300 border-stone-700 hover:text-amber-300'
                          }`}
                        >
                          TECHNICAL &amp; CAD
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTabChange(portfolio.id, 'software')}
                          className={`font-display text-[9px] px-2.5 py-1 uppercase tracking-wider border cursor-pointer transition-colors ${
                            currentTab === 'software'
                              ? 'bg-amber-400 text-stone-950 font-bold border-amber-300'
                              : 'bg-stone-900 text-slate-300 border-stone-700 hover:text-amber-300'
                          }`}
                        >
                          AUTONOMOUS
                        </button>
                      </div>
                    </div>

                    {/* Tab Contents */}
                    <div className="font-body text-xs sm:text-sm text-slate-200 leading-relaxed min-h-[90px]">
                      {currentTab === 'overview' && (
                        <div>
                          <p className="text-slate-300 leading-relaxed mb-3">
                            {portfolio.summary.overview}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80">
                            <span className="font-display text-[9px] text-amber-400">NOTABLE MECHANISMS:</span>
                            {portfolio.notableMechanisms.map((mech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-stone-900 border border-stone-700 text-slate-300 text-[10px] font-mono"
                              >
                                {mech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentTab === 'outreach' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-display text-[9px] text-sky-400 mb-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>COMMUNITY OUTREACH &amp; CONNECTING HIGHLIGHTS:</span>
                          </div>
                          <ul className="space-y-2">
                            {portfolio.summary.outreach.map((item, idx) => {
                              const { title, description } = parseBullet(item);
                              return (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                                  <span className="text-amber-400 font-bold shrink-0">▶</span>
                                  <span>
                                    {title && <strong className="text-white font-semibold">{title}: </strong>}
                                    {description}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {currentTab === 'technical' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-display text-[9px] text-amber-400 mb-1">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>MECHANICAL SUBSYSTEMS &amp; CAD PROCESS:</span>
                          </div>
                          <ul className="space-y-2">
                            {portfolio.summary.technical.map((item, idx) => {
                              const { title, description } = parseBullet(item);
                              return (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                                  <span className="text-amber-400 font-bold shrink-0">▶</span>
                                  <span>
                                    {title && <strong className="text-white font-semibold">{title}: </strong>}
                                    {description}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {currentTab === 'software' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-display text-[9px] text-emerald-400 mb-1">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>AUTONOMOUS NAVIGATION, SENSORS &amp; STRATEGY:</span>
                          </div>
                          <ul className="space-y-2">
                            {portfolio.summary.software.map((item, idx) => {
                              const { title, description } = parseBullet(item);
                              return (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                                  <span className="text-amber-400 font-bold shrink-0">▶</span>
                                  <span>
                                    {title && <strong className="text-white font-semibold">{title}: </strong>}
                                    {description}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                      <Link
                        href={ROUTES.PORTFOLIO_DETAIL(portfolio.id)}
                        onClick={() => playPixelSound('click')}
                        className="font-display text-[9px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors group"
                      >
                        <span>READ FULL BREAKDOWN ON DEDICATED TEAM PAGE</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer: View in Modal, Download PDF, Direct Link */}
                <div className="pt-4 border-t-2 border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Dedicated Team Page Link */}
                    <Link
                      href={ROUTES.PORTFOLIO_DETAIL(portfolio.id)}
                      onClick={() => {
                        try {
                          playPixelSound('click');
                        } catch {}
                      }}
                      className="px-4 py-2 bg-amber-400 text-stone-950 font-display text-[10px] font-bold uppercase tracking-wider border-2 border-stone-900 hover:bg-amber-300 flex items-center gap-1.5 shadow-[2px_2px_0_#000000] cursor-pointer transition-colors"
                    >
                      <span>VIEW PORTFOLIO PAGE</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* In-Browser Preview Button */}
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          playPixelSound('click');
                        } catch {}
                        setPreviewPortfolio(portfolio);
                      }}
                      className="px-4 py-2 bg-stone-900 text-slate-200 font-display text-[10px] uppercase tracking-wider border-2 border-stone-700 hover:border-amber-400 hover:text-amber-300 flex items-center gap-1.5 shadow-[2px_2px_0_#000000] cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>PREVIEW PDF</span>
                    </button>

                    {/* Direct Download Button */}
                    <a
                      href={portfolio.pdfUrl}
                      download
                      onClick={() => {
                        try {
                          playPixelSound('click');
                        } catch {}
                      }}
                      className="px-4 py-2 bg-stone-900 text-slate-200 font-display text-[10px] uppercase tracking-wider border-2 border-stone-700 hover:border-amber-400 hover:text-amber-300 flex items-center gap-1.5 shadow-[2px_2px_0_#000000] cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>DOWNLOAD ({portfolio.fileSize})</span>
                    </a>
                  </div>

                  <Link
                    href={ROUTES.PORTFOLIO_DETAIL(portfolio.id)}
                    onClick={() => playPixelSound('click')}
                    className="font-display text-[9px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <span>OPEN DEDICATED PAGE</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </PixelPanel>
            );
          })}

          {filteredPortfolios.length === 0 && (
            <div className="p-12 text-center bg-stone-900 border-2 border-stone-800">
              <p className="font-display text-sm text-slate-300 mb-3">No FTC portfolios match your search criteria.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-amber-400 text-stone-950 font-display text-[10px] font-bold uppercase tracking-wider border-2 border-stone-900"
              >
                RESET ALL FILTERS
              </button>
            </div>
          )}
        </div>

        {/* Bottom Callout linking to Resources Hub & CAD Lab */}
        <div className="mt-14 p-6 sm:p-8 bg-stone-900 border-2 border-stone-700 shadow-[3px_3px_0_#000000] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-display text-[9px] text-amber-400 uppercase tracking-wider mb-1">
              <PixelIcon name="chest" size={16} />
              <span>ROBOLADS OPEN REPOSITORY</span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl text-white">
              NEED 3D CAD FILES &amp; RAW ROBOT CODE?
            </h3>
            <p className="font-body text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Inspect our interactive 3D robot model in the CAD Lab, or browse open-source RoadRunner code and failure logs in the Resources repository.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <PixelButton href={ROUTES.CAD} variant="primary">
              <span>EXPLORE CAD LAB</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </PixelButton>
            <PixelButton href={ROUTES.RESOURCES} variant="stone">
              <span>VIEW RESOURCES</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </PixelButton>
          </div>
        </div>
      </main>

      {/* 5. In-Browser PDF Preview Modal */}
      {previewPortfolio && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm"
          onClick={() => setPreviewPortfolio(null)}
        >
          <div
            className="w-full max-w-5xl bg-[#0e1023] border-4 border-amber-400 flex flex-col max-h-[92vh] shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Topbar */}
            <div className="p-4 bg-stone-900 border-b-2 border-stone-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="px-2.5 py-1 bg-amber-400 text-stone-950 font-display text-[10px] font-bold shrink-0">
                  FTC #{previewPortfolio.teamNumber}
                </div>
                <div className="truncate">
                  <h3 className="font-heading text-base sm:text-lg text-white truncate">
                    {previewPortfolio.teamName} — Portfolio
                  </h3>
                  <p className="font-body text-xs text-slate-400 truncate">
                    {previewPortfolio.season} • {previewPortfolio.pageCount} Pages • {previewPortfolio.schoolOrOrg}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewPortfolio.pdfUrl}
                  download
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 border border-stone-600 text-slate-200 text-xs font-display hover:text-amber-400 transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD</span>
                </a>
                <a
                  href={previewPortfolio.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 border border-stone-600 text-slate-200 text-xs font-display hover:text-amber-400 transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>NEW TAB</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      playPixelSound('click');
                    } catch {}
                    setPreviewPortfolio(null);
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white font-display text-xs font-bold hover:bg-red-500 cursor-pointer shadow-[2px_2px_0_#000000]"
                  title="Close viewer (Esc)"
                >
                  ✕ CLOSE
                </button>
              </div>
            </div>

            {/* Modal Iframe Container */}
            <div className="flex-1 w-full bg-stone-950 p-2 sm:p-4 min-h-[500px]">
              <iframe
                src={`${previewPortfolio.pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full min-h-[520px] sm:min-h-[620px] border-2 border-stone-800"
                title={`${previewPortfolio.teamName} Engineering Portfolio PDF`}
              />
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-3 bg-stone-900 border-t-2 border-stone-800 flex items-center justify-between text-xs font-body text-slate-400">
              <span>Press [ESC] or click outside to dismiss viewer.</span>
              <a
                href={previewPortfolio.pdfUrl}
                download
                className="text-amber-400 hover:underline flex items-center gap-1 font-display text-[10px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SAVE FILE ({previewPortfolio.fileSize})</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 6. Global Footer */}
      <BlockyFooter />
    </div>
  );
}
