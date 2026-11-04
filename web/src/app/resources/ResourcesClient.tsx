'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/routes';
import { BlockyHeader } from '@/components/BlockyHeader';
import { BlockyFooter } from '@/components/BlockyFooter';
import { PixelPanel, PixelButton, PixelIcon, HUD } from '@/components/pixel';
import { useWorldTheme } from '@/lib/useWorldTheme';
import { playPixelSound } from '@/lib/pixel-sound';
import {
  Tag,
  Calendar,
  User,
  ArrowRight,
  Search,
  X,
  FileCode,
  FileText,
  Box,
  Wrench,
  AlertTriangle,
  Download,
  ExternalLink,
  ChevronUp,
} from 'lucide-react';
import type { Resource } from '@/lib/queries';

interface ResourcesClientProps {
  initialResources: Resource[];
  initialCategory?: string;
  initialTag?: string;
}

const CATEGORIES: Array<{
  id: string;
  label: string;
  icon: 'chest' | 'compass' | 'wrench' | 'gear' | 'star';
}> = [
  { id: 'ALL', label: 'ALL ASSETS', icon: 'chest' },
  { id: 'CAD', label: 'CAD SCHEMATICS', icon: 'compass' },
  { id: 'Programming', label: 'AUTON & CODE', icon: 'wrench' },
  { id: 'Mechanical', label: 'MECHANISMS', icon: 'gear' },
  { id: 'Failure Log', label: 'FAILURE LOGS', icon: 'star' },
];

export function ResourcesClient({
  initialResources,
  initialCategory,
  initialTag,
}: ResourcesClientProps) {
  const { theme } = useWorldTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || 'ALL'
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(
    initialTag || null
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTopBtn, setShowTopBtn] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Format Sanity resources
  const allAvailableResources = useMemo(() => {
    return initialResources.map((item) => ({
      _id: item._id,
      title: item.title,
      category: item.category || 'Mechanical',
      author: item.author || 'RoboLads Engineering Unit',
      publishedAt: item.publishedAt || item._createdAt || '2026-03-01',
      description: ((): string => {
        if (!Array.isArray(item.description) || item.description.length === 0) {
          return 'Official FTC engineering asset released by RoboLads Team #31113.';
        }
        for (const b of item.description) {
          if (b._type === 'callout' && b.text) return String(b.text);
          if (Array.isArray(b.children)) {
            const txt = b.children.map((c: any) => c.text || '').join('').trim();
            if (txt) return txt;
          }
        }
        return 'Official FTC engineering asset released by RoboLads Team #31113.';
      })(),
      tags: (item.tags || []).map((t: any) => String(t)),
      fileFormat: item.file?.asset?.extension?.toUpperCase() || 'DOCUMENT',
      fileSize: item.file?.asset?.size
        ? `${(item.file.asset.size / (1024 * 1024)).toFixed(1)} MB`
        : 'ARCHIVE',
      actionLabel: 'INSPECT RESOURCE',
      actionHref: ROUTES.RESOURCE_DETAIL(item._id),
      isCad3D: item.category === 'CAD',
    }));
  }, [initialResources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return allAvailableResources.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(query));
        const matchesAuthor = item.author.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTag && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [allAvailableResources, selectedCategory, selectedTag, searchQuery]);

  const handleCategoryClick = (catId: string) => {
    try {
      playPixelSound('click');
    } catch {}
    setSelectedCategory(catId);
  };

  const handleTagClick = (tag: string) => {
    try {
      playPixelSound('click');
    } catch {}
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

  const clearFilters = () => {
    try {
      playPixelSound('click');
    } catch {}
    setSelectedCategory('ALL');
    setSelectedTag(null);
    setSearchQuery('');
  };

  return (
    <div className="proto-root landing-root flex flex-col min-h-screen">
      {/* 1. Coherent Header identical to Homepage */}
      <BlockyHeader />

      {/* 2. Main Content Container */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 block-page-enter">
        {/* Navigation Tabs between Engineering Assets and Portfolios */}
        <div className="mb-8 flex items-center gap-2 border-b-2 border-stone-800 pb-3">
          <div className="font-display text-[10px] sm:text-xs px-4 py-2 border-2 bg-amber-400 text-stone-950 font-bold border-amber-300 flex items-center gap-2 shadow-[2px_2px_0_#000000] translate-y-[-1px]">
            <PixelIcon name="chest" size={16} />
            <span>ENGINEERING ASSETS &amp; CAD</span>
          </div>
          <Link
            href={ROUTES.PORTFOLIOS}
            onClick={() => playPixelSound('click')}
            className="font-display text-[10px] sm:text-xs px-4 py-2 border-2 bg-stone-900 text-slate-300 border-stone-700 hover:border-amber-400 hover:text-amber-300 flex items-center gap-2 transition-all shadow-[2px_2px_0_#000000]"
          >
            <PixelIcon name="star" size={16} />
            <span>FTC ENGINEERING PORTFOLIOS</span>
          </Link>
        </div>

        {/* Engineering Repository Title Banner */}
        <div className="mb-10 pb-8 border-b-2 border-stone-800">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black font-display text-[9px] uppercase tracking-wider shadow-[2px_2px_0_#000000]">
              <PixelIcon name="chest" size={16} />
              <span>FTC #31113 • ENGINEERING REPOSITORY</span>
            </div>

            <div className="font-mono text-xs text-slate-400">
              {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'}
            </div>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide">
            ROBOLADS <span className="text-amber-400">RESOURCES</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-3xl font-body leading-relaxed">
            Open-source competition CAD schematics, autonomous RoadRunner code modules, mechanical assembly guides, and raw engineering failure logs from FIRST Tech Challenge Team #31113.
          </p>

          {/* Portfolio Hub Callout Banner */}
          <div className="mt-5 p-3.5 bg-stone-900 border-2 border-stone-700 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0_#000000]">
            <div className="flex items-center gap-2.5">
              <PixelIcon name="star" size={16} />
              <div>
                <span className="font-display text-[10px] text-amber-400 font-bold block">
                  LOOKING FOR FTC TEAM ENGINEERING PORTFOLIOS?
                </span>
                <span className="font-body text-xs text-slate-300 block">
                  Browse complete 15-page FTC engineering portfolios, award records, and executive summaries.
                </span>
              </div>
            </div>
            <Link
              href={ROUTES.PORTFOLIOS}
              className="px-3.5 py-1.5 bg-amber-400 text-stone-950 font-display text-[9px] font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors shadow-[2px_2px_0_#000000]"
            >
              VISIT PORTFOLIO HUB →
            </Link>
          </div>
        </div>

        {/* 3. Search & Category Hotbar Controls */}
        <div className="mb-8 flex flex-col gap-5">
          {/* Live Search Input */}
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CAD assemblies, autonomous pathing, odometry, failure logs..."
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

          {/* Category Tabs (Minecraft Chest Hotbar Style) */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`font-display text-[9px] sm:text-[10px] px-3.5 py-2 uppercase tracking-wider border-2 flex items-center gap-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-black border-white font-bold shadow-[2px_2px_0_#000000] translate-y-[-1px]'
                      : 'bg-stone-900 text-slate-300 border-stone-700 hover:border-amber-400 hover:text-amber-300 shadow-[2px_2px_0_#000000]'
                  }`}
                >
                  <PixelIcon name={cat.icon} size={16} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {/* Active Tag Filter Indicator */}
            {selectedTag && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 border-2 border-amber-400 text-amber-300 font-display text-[9px] shadow-[2px_2px_0_#000000] ml-1">
                <span>TAG: #{selectedTag}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="hover:text-amber-400 ml-1 cursor-pointer"
                  title="Remove tag filter"
                >
                  ✕
                </button>
              </div>
            )}

            {(selectedCategory !== 'ALL' || selectedTag || searchQuery) && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-display text-[9px] px-3 py-2 bg-red-950/80 border-2 border-red-500/50 text-red-300 hover:border-red-400 hover:text-red-200 flex items-center gap-1 shadow-[2px_2px_0_#000000] cursor-pointer ml-auto"
              >
                <X className="w-3 h-3" />
                <span>RESET FILTERS</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Special Failure Log Educational Banner */}
        {selectedCategory === 'Failure Log' && (
          <div className="mb-8">
            <PixelPanel variant="night" rivets className="p-6 border-amber-500 bg-amber-950/30">
              <div className="flex items-center gap-2 mb-2">
                <PixelIcon name="star" size={32} />
                <span className="font-display text-xs text-amber-400">
                  POST-MORTEM BUILD LOGS
                </span>
              </div>
              <h2 className="font-heading text-lg sm:text-xl text-white mb-2">
                TURNING DESIGN FAILURES INTO COMPETITION TRIUMPHS
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed max-w-3xl">
                In FIRST Tech Challenge, every mechanism shear, loose belt stage, and power brownout is our most valuable source of telemetry. Our Failure Log documents the engineering post-mortems, root-cause analyses, and iterative CAD revisions that brought DecodeBot to competition readiness.
              </p>
            </PixelPanel>
          </div>
        )}

        {/* 5. Resources Cards Grid */}
        {filteredResources.length === 0 ? (
          <PixelPanel variant="night" rivets className="p-12 text-center my-8">
            <div className="flex justify-center mb-3">
              <PixelIcon name="chest" size={32} />
            </div>
            <p className="font-heading text-base text-amber-400 mb-2">
              NO MATCHING ITEMS IN VAULT
            </p>
            <p className="text-xs sm:text-sm text-slate-300 font-body max-w-md mx-auto mb-6">
              No schematics or logs match your current search criteria. Try selecting another category or resetting the search filter.
            </p>
            <PixelButton onClick={clearFilters} variant="primary">
              SHOW ALL RESOURCES
            </PixelButton>
          </PixelPanel>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {filteredResources.map((item) => {
              const isFailure = item.category === 'Failure Log';
              const isCad = item.category === 'CAD';
              const isProg = item.category === 'Programming';

              return (
                <PixelPanel
                  key={item._id}
                  variant="stone"
                  className="p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-150"
                >
                  <div>
                    {/* Top Meta Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span
                        className={`font-display text-[9px] px-2.5 py-1 border-2 uppercase tracking-wider ${
                          isCad
                            ? 'border-sky-400 bg-sky-950/80 text-sky-300'
                            : isProg
                            ? 'border-purple-400 bg-purple-950/80 text-purple-300'
                            : isFailure
                            ? 'border-red-400 bg-red-950/80 text-red-300'
                            : 'border-amber-400 bg-amber-950/80 text-amber-300'
                        }`}
                      >
                        {item.category}
                      </span>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-body">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-stone-900 border border-stone-700 text-amber-400">
                          {item.fileFormat}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="font-heading text-lg sm:text-xl text-white hover:text-amber-400 transition-colors mb-2.5">
                      <Link href={item.actionHref}>
                        {item.title}
                      </Link>
                    </h2>

                    {/* Author */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-body mb-3">
                      <User className="w-3 h-3 text-amber-400" />
                      <span>{item.author}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Tags List */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleTagClick(t)}
                            className={`text-[9px] px-2 py-0.5 font-display border cursor-pointer transition-colors ${
                              selectedTag === t
                                ? 'bg-amber-400 text-black border-amber-300 font-bold'
                                : 'bg-stone-900 border-stone-700 text-slate-400 hover:text-amber-300 hover:border-amber-400'
                            }`}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Action Strip */}
                  <div className="mt-4 pt-4 border-t-2 border-stone-700 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] text-slate-400">
                      FILE SIZE: <span className="text-slate-200">{item.fileSize}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {item.isCad3D ? (
                        <PixelButton href={ROUTES.CAD} variant="primary" className="text-xs">
                          <Box className="w-3.5 h-3.5 mr-1" />
                          <span>3D CAD LAB ⛶</span>
                        </PixelButton>
                      ) : (
                        <PixelButton href={item.actionHref} variant="primary" className="text-xs">
                          <span>{item.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </PixelButton>
                      )}
                    </div>
                  </div>
                </PixelPanel>
              );
            })}
          </div>
        )}
      </main>

      {/* 6. Coherent Bedrock Footer identical to Homepage */}
      <BlockyFooter />

      {/* 7. Floating Back to Top Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`btn-to-top ${showTopBtn ? 'visible' : ''}`}
        title="Back to Top"
        aria-label="Back to Top"
      >
        ▲ TOP
      </button>
    </div>
  );
}
