'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Eye,
  Download,
  FileText,
  Search,
  X,
  Loader2,
  RefreshCw,
  BookOpen,
  ExternalLink,
  Calendar,
  User,
  Paperclip,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ROUTES } from '@/routes';
import type { Resource, Post, AnalyticsSummary } from '@/lib/queries';
import type { FtcPortfolio } from '@/lib/portfolioTypes';

export default function AdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'resources' | 'portfolios' | 'posts' | 'analytics'>('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [portfolios, setPortfolios] = useState<FtcPortfolio[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Authenticated fetch helper
  const adminFetch = useCallback(
    async (url: string, init?: RequestInit) => {
      const res = await fetch(url, init);
      if (res.status === 401) {
        router.push(ROUTES.ADMIN_LOGIN);
        throw new Error('Your admin session has expired. Please sign in again.');
      }
      return res;
    },
    [router]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    setAnalyticsError('');

    const [resList, portList, postsList, resStats] = await Promise.allSettled([
      adminFetch('/api/admin/resources').then((r) => r.json()),
      adminFetch('/api/admin/portfolios').then((r) => r.json()),
      adminFetch('/api/admin/posts').then((r) => r.json()),
      adminFetch('/api/admin/analytics').then((r) => r.json()),
    ]);

    if (resList.status === 'fulfilled' && resList.value?.success) {
      setResources(resList.value.data as Resource[]);
    } else {
      setLoadError(
        resList.status === 'fulfilled'
          ? resList.value?.error || 'Failed to load resource list.'
          : String(resList.reason?.message ?? resList.reason)
      );
    }

    if (portList.status === 'fulfilled' && portList.value?.success) {
      setPortfolios(portList.value.data as FtcPortfolio[]);
    }

    if (postsList.status === 'fulfilled' && postsList.value?.success) {
      setPosts(postsList.value.data as Post[]);
    }

    if (resStats.status === 'fulfilled' && resStats.value?.success) {
      setAnalytics(resStats.value.data as AnalyticsSummary);
    } else {
      setAnalyticsError(
        resStats.status === 'fulfilled'
          ? resStats.value?.error || 'Failed to load analytics summary.'
          : String(resStats.reason?.message ?? resStats.reason)
      );
    }

    setLoading(false);
  }, [adminFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Combine view & download stats per resource
  const statsById = useMemo(() => {
    const map = new Map<string, { views: number; downloads: number }>();
    analytics?.byResource?.forEach((r) =>
      map.set(r.resourceId, { views: r.views, downloads: r.downloads })
    );
    return map;
  }, [analytics]);

  const filteredResources = useMemo(
    () =>
      resources.filter((r) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        const inTitle = r.title?.toLowerCase().includes(query);
        const inAuthor = r.author?.toLowerCase().includes(query);
        const inTags = Array.isArray(r.tags) && r.tags.some((t) => t.toLowerCase().includes(query));
        return inTitle || inAuthor || inTags;
      }),
    [resources, searchTerm]
  );

  const filteredPosts = useMemo(
    () =>
      posts.filter((p) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        const inTitle = p.title?.toLowerCase().includes(query);
        const inAuthor = p.author?.toLowerCase().includes(query);
        const inTags = Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(query));
        return inTitle || inAuthor || inTags;
      }),
    [posts, searchTerm]
  );

  const filteredPortfolios = useMemo(
    () =>
      portfolios.filter((p) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        const inNum = p.teamNumber.toLowerCase().includes(query);
        const inName = p.teamName.toLowerCase().includes(query);
        const inSeason = p.season.toLowerCase().includes(query);
        const inAwards = p.awards?.some((a) => a.name.toLowerCase().includes(query));
        const inMechanisms = p.notableMechanisms?.some((m) => m.toLowerCase().includes(query));
        return inNum || inName || inSeason || inAwards || inMechanisms;
      }),
    [portfolios, searchTerm]
  );

  const chartData = useMemo(
    () =>
      [...(analytics?.byResource ?? [])]
        .sort((a, b) => b.views + b.downloads - (a.views + a.downloads))
        .slice(0, 10)
        .map((r) => ({
          name: (r.title ?? 'Untitled').length > 20 ? (r.title ?? '').slice(0, 19) + '…' : r.title ?? 'Untitled',
          Views: r.views,
          Downloads: r.downloads,
        })),
    [analytics]
  );

  const handleLogout = async () => {
    await fetch(ROUTES.API.ADMIN_LOGOUT, { method: 'POST' });
    router.push(ROUTES.ADMIN_LOGIN);
    router.refresh();
  };

  const handleDeleteResource = async (item: Resource) => {
    if (!window.confirm(`Delete "${item.title}"? Associated telemetry events will also be cleared.`)) return;

    try {
      const res = await adminFetch(`/api/admin/resources/${item._id}`, { method: 'DELETE' });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Failed to delete resource asset.');
      setResources((prev) => prev.filter((r) => r._id !== item._id));
      loadData();
    } catch (error: any) {
      alert(error.message || 'Error deleting resource asset.');
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (!window.confirm(`Delete dispatch "${post.title}"? This cannot be undone.`)) return;

    try {
      const res = await adminFetch(`/api/admin/posts/${post._id}`, { method: 'DELETE' });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Failed to delete post.');
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      loadData();
    } catch (error: any) {
      alert(error.message || 'Error deleting post.');
    }
  };

  const handleDeletePortfolio = async (item: FtcPortfolio) => {
    if (!window.confirm(`Delete portfolio for FTC #${item.teamNumber} "${item.teamName}"? This cannot be undone.`)) return;

    try {
      const res = await adminFetch(`/api/admin/portfolios/${item.id}`, { method: 'DELETE' });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Failed to delete portfolio.');
      setPortfolios((prev) => prev.filter((p) => p.id !== item.id));
      loadData();
    } catch (error: any) {
      alert(error.message || 'Error deleting portfolio.');
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'CAD':
        return 'border-sky-400 bg-sky-950/70 text-sky-300';
      case 'Programming':
        return 'border-purple-400 bg-purple-950/70 text-purple-300';
      case 'Mechanical':
        return 'border-amber-400 bg-amber-950/70 text-amber-300';
      case 'Failure Log':
        return 'border-red-400 bg-red-950/70 text-red-300';
      default:
        return 'border-emerald-400 bg-emerald-950/70 text-emerald-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#050610] text-slate-100 flex flex-col font-mono">
      {/* =========================================================================
          TOP UNIFIED NAVIGATION (Replaces heavy cramped sidebar)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#08081a]/95 backdrop-blur border-b-2 border-[#161a33] px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 text-black font-pixel text-xs flex items-center justify-center font-bold shadow-[2px_2px_0_#000000]">
              RBL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-white tracking-wider">ROBOLADS ADMIN</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  #31113
                </span>
              </div>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="flex items-center gap-1.5 bg-[#050610] p-1 border-2 border-[#161a33] shadow-[inset_1px_1px_0_#000000]">
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-pixel transition-all cursor-pointer ${
                activeTab === 'resources'
                  ? 'bg-amber-400 text-black font-bold shadow-[2px_2px_0_#000000]'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#10142e]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              RESOURCES
              <span
                className={`text-[9px] px-1.5 py-0.2 font-mono ${
                  activeTab === 'resources' ? 'bg-black text-amber-300' : 'bg-[#161a33] text-slate-300'
                }`}
              >
                {resources.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('portfolios')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-pixel transition-all cursor-pointer ${
                activeTab === 'portfolios'
                  ? 'bg-amber-400 text-black font-bold shadow-[2px_2px_0_#000000]'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#10142e]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              PORTFOLIOS
              <span
                className={`text-[9px] px-1.5 py-0.2 font-mono ${
                  activeTab === 'portfolios' ? 'bg-black text-amber-300' : 'bg-[#161a33] text-slate-300'
                }`}
              >
                {portfolios.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-pixel transition-all cursor-pointer ${
                activeTab === 'posts'
                  ? 'bg-amber-400 text-black font-bold shadow-[2px_2px_0_#000000]'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#10142e]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              DISPATCHES
              <span
                className={`text-[9px] px-1.5 py-0.2 font-mono ${
                  activeTab === 'posts' ? 'bg-black text-amber-300' : 'bg-[#161a33] text-slate-300'
                }`}
              >
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-pixel transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-amber-400 text-black font-bold shadow-[2px_2px_0_#000000]'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#10142e]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              ANALYTICS
            </button>
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <Link
              href={ROUTES.HOME}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
              title="Open public website in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Site</span>
            </Link>

            <div className="h-4 w-px bg-[#161a33]" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN SPACIOUS CONTENT AREA
          ========================================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
        {loading && (
          <div className="mb-6 flex items-center text-slate-400 text-xs font-mono bg-[#0c0e21] border border-[#161a33] p-3">
            <Loader2 className="h-4 w-4 animate-spin mr-2 text-amber-400" />
            Loading repository data...
          </div>
        )}

        {loadError && (
          <div className="mb-6 p-4 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-mono flex items-center justify-between shadow-[4px_4px_0_#000000]">
            <span>⚠️ {loadError}</span>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 underline hover:text-red-300 cursor-pointer ml-4 font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {/* =========================================================================
            TAB 1: RESOURCE MANAGEMENT
            ========================================================================= */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#161a33]">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-wide">
                  Engineering Resources
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Manage CAD models, programming modules, and technical guides ({resources.length} total)
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by title, tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#08081a] border-2 border-[#161a33] focus:border-amber-400 pl-8 pr-7 py-1.5 text-xs font-mono text-white focus:outline-none shadow-[inset_1px_1px_0_#000000]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-2 text-slate-500 hover:text-amber-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Create Resource Button */}
                <Link
                  href={ROUTES.ADMIN_RESOURCE_NEW}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-pixel font-bold shadow-[2px_2px_0_#000000] border-2 border-amber-300 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  NEW RESOURCE
                </Link>
              </div>
            </div>

            {/* Clean Resource List */}
            <div className="bg-[#0c0e21] border-2 border-[#161a33] shadow-[4px_4px_0_#000000] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08081a] border-b-2 border-[#161a33] text-slate-400 uppercase text-[9px] font-pixel tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">RESOURCE &amp; SPECIFICATION</th>
                    <th className="px-4 py-3.5">DISCIPLINE</th>
                    <th className="px-4 py-3.5">ATTACHMENT</th>
                    <th className="px-4 py-3.5">ENGAGEMENT</th>
                    <th className="px-5 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141833]">
                  {filteredResources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono text-xs">
                        {loading
                          ? 'Loading resources...'
                          : searchTerm
                          ? `No resources matching "${searchTerm}".`
                          : 'No resources published yet. Click "+ NEW RESOURCE" to create one.'}
                      </td>
                    </tr>
                  ) : (
                    filteredResources.map((item) => {
                      const stats = statsById.get(item._id);
                      const file = item.file?.asset;

                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-[#121633]/60 transition-colors group"
                        >
                          {/* Title & Metadata */}
                          <td className="px-5 py-4 max-w-sm">
                            <Link
                              href={ROUTES.ADMIN_RESOURCE_EDIT(item._id)}
                              className="text-white font-bold hover:text-amber-400 transition-colors text-sm font-heading block tracking-wide"
                            >
                              {item.title}
                            </Link>

                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1 text-slate-300">
                                <User className="w-3 h-3 text-amber-400" />
                                {item.author || 'RoboLads Engineering'}
                              </span>

                              {item.publishedAt && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    {new Date(item.publishedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Tags */}
                            {Array.isArray(item.tags) && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[8px] font-pixel px-1.5 py-0.2 bg-[#050610] text-slate-400 border border-[#161a33]"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`text-[9px] font-pixel px-2 py-0.5 border ${getCategoryColor(
                                item.category
                              )}`}
                            >
                              {item.category || 'GENERAL'}
                            </span>
                          </td>

                          {/* Attachment Package */}
                          <td className="px-4 py-4 text-xs font-mono text-slate-300">
                            {file?.url ? (
                              <div className="flex items-center gap-2">
                                <span className="font-pixel text-[9px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 border border-cyan-400/40">
                                  {file.extension?.toUpperCase() || 'FILE'}
                                </span>
                                <span className="text-[11px] text-slate-300">
                                  {file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'Attached'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px] italic">No file attached</span>
                            )}
                          </td>

                          {/* Engagement */}
                          <td className="px-4 py-4 whitespace-nowrap text-xs font-mono">
                            <div className="flex items-center gap-3">
                              <span className="text-amber-300 flex items-center gap-1" title="Views">
                                <Eye className="w-3 h-3 text-amber-400" />
                                {stats?.views ?? 0}
                              </span>
                              <span className="text-cyan-300 flex items-center gap-1" title="Downloads">
                                <Download className="w-3 h-3 text-cyan-400" />
                                {stats?.downloads ?? 0}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right whitespace-nowrap space-x-1">
                            <Link
                              href={ROUTES.RESOURCE_DETAIL(item._id)}
                              target="_blank"
                              rel="noreferrer"
                              title="View public resource"
                              className="inline-flex items-center p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#161a33] transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>

                            <Link
                              href={ROUTES.ADMIN_RESOURCE_EDIT(item._id)}
                              title="Edit resource"
                              className="inline-flex items-center p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#161a33] transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDeleteResource(item)}
                              title="Delete resource"
                              className="inline-flex items-center p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#161a33] transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: FTC ENGINEERING PORTFOLIOS
            ========================================================================= */}
        {activeTab === 'portfolios' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#161a33]">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-wide">
                  FTC Engineering Portfolios
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Manage team portfolios, awards archive, and executive summaries ({portfolios.length} total)
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by team #, name, awards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#08081a] border-2 border-[#161a33] focus:border-amber-400 pl-8 pr-7 py-1.5 text-xs font-mono text-white focus:outline-none shadow-[inset_1px_1px_0_#000000]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-2 text-slate-500 hover:text-amber-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Create Portfolio Button */}
                <Link
                  href={ROUTES.ADMIN_PORTFOLIO_NEW}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-pixel font-bold shadow-[2px_2px_0_#000000] border-2 border-amber-300 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  NEW PORTFOLIO
                </Link>
              </div>
            </div>

            {/* Clean Portfolios Table */}
            <div className="bg-[#0c0e21] border-2 border-[#161a33] shadow-[4px_4px_0_#000000] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08081a] border-b-2 border-[#161a33] text-slate-400 uppercase text-[9px] font-pixel tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">TEAM &amp; CHALLENGE</th>
                    <th className="px-4 py-3.5">MAJOR AWARDS</th>
                    <th className="px-4 py-3.5">DOCUMENT ASSET</th>
                    <th className="px-4 py-3.5">MECHANISMS</th>
                    <th className="px-5 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141833]">
                  {filteredPortfolios.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono text-xs">
                        {loading
                          ? 'Loading portfolios...'
                          : searchTerm
                          ? `No portfolios matching "${searchTerm}".`
                          : 'No portfolios published yet. Click "+ NEW PORTFOLIO" to create one.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPortfolios.map((item) => (
                      <tr key={item.id} className="hover:bg-[#121633]/60 transition-colors group">
                        {/* Team & Challenge */}
                        <td className="px-5 py-4 max-w-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-pixel text-[10px] px-2 py-0.5 bg-amber-400 text-black font-bold">
                              FTC #{item.teamNumber}
                            </span>
                            <span className="text-[10px] text-amber-300 font-mono border border-stone-700 px-1.5 py-0.5 bg-[#050610]">
                              {item.season}
                            </span>
                          </div>
                          <Link
                            href={ROUTES.ADMIN_PORTFOLIO_EDIT(item.id)}
                            className="text-white font-bold hover:text-amber-400 transition-colors text-sm font-heading block tracking-wide"
                          >
                            {item.teamName}
                          </Link>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {item.schoolOrOrg} • {item.location}
                          </div>
                        </td>

                        {/* Major Awards */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 max-w-xs">
                            {item.awards && item.awards.length > 0 ? (
                              item.awards.map((award, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] text-amber-300 flex items-center gap-1 font-mono"
                                >
                                  <span>🏆</span>
                                  <span className="font-medium">{award.name}</span>
                                  {award.level && <span className="text-slate-500">({award.level})</span>}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 text-[10px] italic">No awards listed</span>
                            )}
                          </div>
                        </td>

                        {/* Document Asset */}
                        <td className="px-4 py-4">
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 hover:underline font-mono text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF ({item.fileSize})</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {item.pageCount} Pages FTC Standard
                          </div>
                        </td>

                        {/* Mechanisms */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {item.notableMechanisms && item.notableMechanisms.length > 0 ? (
                              item.notableMechanisms.map((mech, mi) => (
                                <span
                                  key={mi}
                                  className="text-[8px] font-pixel px-1.5 py-0.5 bg-[#050610] text-slate-300 border border-[#161a33]"
                                >
                                  {mech}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 text-[10px] italic">—</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                          <Link
                            href={ROUTES.PORTFOLIO_DETAIL(item.id)}
                            target="_blank"
                            rel="noreferrer"
                            title="View dedicated team portfolio page"
                            className="inline-flex items-center p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#161a33] transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          <Link
                            href={ROUTES.ADMIN_PORTFOLIO_EDIT(item.id)}
                            title="Edit portfolio"
                            className="inline-flex items-center p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#161a33] transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeletePortfolio(item)}
                            title="Delete portfolio"
                            className="inline-flex items-center p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#161a33] transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: BLOG & DISPATCHES
            ========================================================================= */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#161a33]">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-wide">
                  Team Dispatches
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Author rich articles, build updates, and match recaps ({posts.length} total)
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by title, tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#08081a] border-2 border-[#161a33] focus:border-amber-400 pl-8 pr-7 py-1.5 text-xs font-mono text-white focus:outline-none shadow-[inset_1px_1px_0_#000000]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-2 text-slate-500 hover:text-amber-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Create Post Button */}
                <Link
                  href={ROUTES.ADMIN_POST_NEW}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-pixel font-bold shadow-[2px_2px_0_#000000] border-2 border-amber-300 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  NEW DISPATCH
                </Link>
              </div>
            </div>

            {/* Clean Dispatch List */}
            <div className="bg-[#0c0e21] border-2 border-[#161a33] shadow-[4px_4px_0_#000000] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08081a] border-b-2 border-[#161a33] text-slate-400 uppercase text-[9px] font-pixel tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">DISPATCH &amp; EXCERPT</th>
                    <th className="px-4 py-3.5">CATEGORY</th>
                    <th className="px-4 py-3.5">AUTHOR &amp; DATE</th>
                    <th className="px-4 py-3.5">BLOCKS</th>
                    <th className="px-5 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141833]">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono text-xs">
                        {loading
                          ? 'Loading dispatches...'
                          : searchTerm
                          ? `No posts matching "${searchTerm}".`
                          : 'No blog dispatches published yet. Click "+ NEW DISPATCH" to author one.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr
                        key={post._id}
                        className="hover:bg-[#121633]/60 transition-colors group"
                      >
                        {/* Title & Excerpt */}
                        <td className="px-5 py-4 max-w-sm">
                          <Link
                            href={ROUTES.ADMIN_POST_EDIT(post._id)}
                            className="text-white font-bold hover:text-amber-400 transition-colors text-sm font-heading block tracking-wide"
                          >
                            {post.title}
                          </Link>

                          {post.excerpt && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 font-body mt-1">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Tags */}
                          {Array.isArray(post.tags) && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[8px] font-pixel px-1.5 py-0.2 bg-[#050610] text-slate-400 border border-[#161a33]"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="bg-[#050610] border border-[#1e223d] px-2 py-0.5 text-[9px] font-pixel text-amber-400">
                            {post.category || 'Season Update'}
                          </span>
                        </td>

                        {/* Author & Date */}
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-300 font-mono">
                          <p className="text-slate-200">{post.author || 'RoboLads Team'}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {post._createdAt
                              ? new Date(post._createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </p>
                        </td>

                        {/* Content Blocks */}
                        <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-cyan-300">
                          <span className="px-2 py-0.5 bg-[#050610] border border-[#161a33] text-[10px]">
                            {Array.isArray(post.body) ? `${post.body.length} blocks` : '0 blocks'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap space-x-1">
                          {post.slug?.current && (
                            <Link
                              href={ROUTES.BLOG_POST(post.slug.current)}
                              target="_blank"
                              rel="noreferrer"
                              title="View public article"
                              className="inline-flex items-center p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#161a33] transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}

                          <Link
                            href={ROUTES.ADMIN_POST_EDIT(post._id)}
                            title="Edit dispatch"
                            className="inline-flex items-center p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#161a33] transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeletePost(post)}
                            title="Delete dispatch"
                            className="inline-flex items-center p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#161a33] transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: DATA ANALYTICS
            ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#161a33]">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-wide">
                  Analytics &amp; Engagement
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Visitor telemetry and asset download metrics
                </p>
              </div>

              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-amber-400 border border-[#161a33] hover:border-amber-400 bg-[#0c0e21] shadow-[2px_2px_0_#000000] cursor-pointer transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            {analyticsError && (
              <div className="p-3 bg-red-950/80 border border-red-500 text-red-300 text-xs font-mono">
                {analyticsError}
              </div>
            )}

            {/* 3 Clean KPI Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0c0e21] border-2 border-[#161a33] p-5 shadow-[3px_3px_0_#000000]">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="font-pixel text-[10px] uppercase">TOTAL VIEWS</span>
                  <Eye className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-300">
                  {analytics?.totalViews ?? 0}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Total public asset page views</p>
              </div>

              <div className="bg-[#0c0e21] border-2 border-[#161a33] p-5 shadow-[3px_3px_0_#000000]">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="font-pixel text-[10px] uppercase">TOTAL DOWNLOADS</span>
                  <Download className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-300">
                  {analytics?.totalDownloads ?? 0}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Total file &amp; package downloads</p>
              </div>

              <div className="bg-[#0c0e21] border-2 border-[#161a33] p-5 shadow-[3px_3px_0_#000000]">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="font-pixel text-[10px] uppercase">TOTAL RESOURCES</span>
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-300">
                  {resources.length}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Engineering packages in vault</p>
              </div>
            </div>

            {/* Engagement Chart */}
            <div className="bg-[#0c0e21] border-2 border-[#161a33] shadow-[4px_4px_0_#000000] p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#141833]">
                <h2 className="font-pixel text-xs text-white uppercase tracking-wider">
                  RESOURCE ENGAGEMENT (TOP 10)
                </h2>
                <div className="flex items-center gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2.5 h-2.5 bg-amber-400 inline-block" /> Views
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-2.5 h-2.5 bg-cyan-400 inline-block" /> Downloads
                  </span>
                </div>
              </div>

              {chartData.length === 0 ? (
                <p className="text-slate-500 text-xs font-mono py-12 text-center">
                  No telemetry recorded yet.
                </p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#141833" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#1a1e38' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#1a1e38' }}
                      />
                      <Tooltip
                        content={<CustomChartTooltip />}
                        cursor={{ fill: 'rgba(251, 191, 36, 0.05)' }}
                      />
                      <Bar dataKey="Views" fill="#fbbf24" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Downloads" fill="#3be0d0" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top 5 Lists */}
            <div className="grid md:grid-cols-2 gap-6">
              <TopRankList
                title="Top Most Viewed Assets"
                items={(analytics?.topViewed ?? []).map((i) => ({
                  id: i.resourceId,
                  title: i.title,
                  count: i.views,
                }))}
                unit="views"
                color="text-amber-400"
              />
              <TopRankList
                title="Top Most Downloaded Assets"
                items={(analytics?.topDownloaded ?? []).map((i) => ({
                  id: i.resourceId,
                  title: i.title,
                  count: i.downloads,
                }))}
                unit="downloads"
                color="text-cyan-400"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Custom Tooltip for Chart
function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#0c0e21] border-2 border-[#3be0d0] p-3 shadow-[4px_4px_0_#000000] text-xs font-mono">
      <p className="font-pixel text-[10px] text-white uppercase mb-2 pb-1 border-b border-slate-700">
        {label}
      </p>
      <div className="space-y-1">
        <p className="text-amber-300 flex items-center justify-between gap-4">
          <span>Views:</span>
          <span className="font-bold">{payload[0]?.value ?? 0}</span>
        </p>
        <p className="text-cyan-300 flex items-center justify-between gap-4">
          <span>Downloads:</span>
          <span className="font-bold">{payload[1]?.value ?? 0}</span>
        </p>
      </div>
    </div>
  );
}

// Clean Top Rank List
function TopRankList({
  title,
  items,
  unit,
  color,
}: {
  title: string;
  items: Array<{ id: string; title?: string; count: number }>;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-[#0c0e21] border-2 border-[#161a33] shadow-[3px_3px_0_#000000] p-5">
      <h3 className="font-pixel text-xs text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#141833]">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-slate-500 text-xs italic py-4 text-center">No telemetry recorded.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-2.5 bg-[#08081a] border border-[#161a33] hover:border-[#2d3561] transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 truncate mr-3">
                <span className="font-pixel text-[9px] text-slate-500 w-4">#{idx + 1}</span>
                <span className="text-slate-200 truncate font-mono">
                  {item.title || 'Untitled Asset'}
                </span>
              </div>
              <span className={`font-mono font-bold whitespace-nowrap text-xs ${color}`}>
                {item.count} <span className="text-[10px] text-slate-500 font-normal">{unit}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
