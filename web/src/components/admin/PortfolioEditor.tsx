'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/routes';
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Plus,
  Trash2,
  FileText,
  Trophy,
  Award,
  Layers,
  Wrench,
  Cpu,
  Users,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { FtcPortfolio, PortfolioAward } from '@/lib/portfolioTypes';

interface PortfolioEditorProps {
  initialPortfolio?: FtcPortfolio;
  isNew?: boolean;
}

const AWARD_TYPES: Array<{ id: PortfolioAward['type']; label: string }> = [
  { id: 'inspire', label: 'Inspire Award' },
  { id: 'think', label: 'Think Award' },
  { id: 'innovate', label: 'Innovate Award' },
  { id: 'connect', label: 'Connect Award' },
  { id: 'control', label: 'Control Award' },
  { id: 'design', label: 'Design Award' },
  { id: 'motivate', label: 'Motivate Award' },
  { id: 'finalist', label: 'Finalist / Alliance' },
];

export function PortfolioEditor({ initialPortfolio, isNew = false }: PortfolioEditorProps) {
  const router = useRouter();

  // Basic Information
  const [teamNumber, setTeamNumber] = useState(initialPortfolio?.teamNumber || '');
  const [teamName, setTeamName] = useState(initialPortfolio?.teamName || '');
  const [schoolOrOrg, setSchoolOrOrg] = useState(initialPortfolio?.schoolOrOrg || '');
  const [location, setLocation] = useState(initialPortfolio?.location || '');
  const [season, setSeason] = useState(initialPortfolio?.season || '');

  // Major Awards
  const [awards, setAwards] = useState<PortfolioAward[]>(
    initialPortfolio?.awards || [
      { name: 'Inspire Award Winner', type: 'inspire', level: 'Regional Championship' },
    ]
  );

  // Executive Summary Sections
  const [overview, setOverview] = useState(initialPortfolio?.summary?.overview || '');
  const [outreachBullets, setOutreachBullets] = useState<string[]>(
    initialPortfolio?.summary?.outreach || ['']
  );
  const [technicalBullets, setTechnicalBullets] = useState<string[]>(
    initialPortfolio?.summary?.technical || ['']
  );
  const [softwareBullets, setSoftwareBullets] = useState<string[]>(
    initialPortfolio?.summary?.software || ['']
  );

  // Tags & Notable Mechanisms
  const [mechanisms, setMechanisms] = useState<string>(
    initialPortfolio?.notableMechanisms?.join(', ') || ''
  );
  const [tags, setTags] = useState<string>(initialPortfolio?.tags?.join(', ') || '');

  // PDF File Asset
  const [pdfUrl, setPdfUrl] = useState(initialPortfolio?.pdfUrl || '');
  const [fileSize, setFileSize] = useState(initialPortfolio?.fileSize || '1.0 MB');
  const [pageCount, setPageCount] = useState<number>(initialPortfolio?.pageCount || 15);
  const [isUploading, setIsUploading] = useState(false);

  // Form Submission State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please upload a valid PDF document.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/portfolios/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload portfolio document');
      }

      setPdfUrl(data.url);
      setFileSize(data.fileSize);
      setPageCount(data.pageCount || 15);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Awards manipulation
  const addAward = () => {
    setAwards((prev) => [
      ...prev,
      { name: 'Think Award 1st Place', type: 'think', level: 'Regional' },
    ]);
  };

  const updateAward = (index: number, patch: Partial<PortfolioAward>) => {
    setAwards((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...patch } : a))
    );
  };

  const removeAward = (index: number) => {
    setAwards((prev) => prev.filter((_, i) => i !== index));
  };

  // Bullet manipulation helper
  const updateBullet = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    val: string
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? val : item)));
  };

  const addBullet = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const removeBullet = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!teamNumber.trim()) {
      setErrorMessage('Team number is required.');
      return;
    }
    if (!teamName.trim()) {
      setErrorMessage('Team name is required.');
      return;
    }
    if (!season.trim()) {
      setErrorMessage('Competition season is required.');
      return;
    }
    if (!pdfUrl.trim()) {
      setErrorMessage('Please upload a portfolio PDF file or provide a valid PDF URL.');
      return;
    }

    setIsSaving(true);

    const payload = {
      teamNumber: teamNumber.trim(),
      teamName: teamName.trim(),
      schoolOrOrg: schoolOrOrg.trim() || 'FIRST Tech Challenge',
      location: location.trim() || 'Worldwide',
      season: season.trim(),
      awards: awards.filter((a) => a.name.trim()),
      summary: {
        overview: overview.trim() || `${teamName} (FTC #${teamNumber}) Engineering Portfolio.`,
        outreach: outreachBullets.map((b) => b.trim()).filter(Boolean),
        technical: technicalBullets.map((b) => b.trim()).filter(Boolean),
        software: softwareBullets.map((b) => b.trim()).filter(Boolean),
      },
      pdfUrl: pdfUrl.trim(),
      fileSize: fileSize.trim() || '1.0 MB',
      pageCount: Number(pageCount) || 15,
      notableMechanisms: mechanisms
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const endpoint = isNew
        ? '/api/admin/portfolios'
        : `/api/admin/portfolios/${initialPortfolio?.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save portfolio');
      }

      setSuccessMessage('Portfolio successfully saved to the repository!');
      setTimeout(() => {
        router.push(ROUTES.ADMIN);
        router.refresh();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving portfolio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050610] text-slate-100 flex flex-col font-mono pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#08081a]/95 backdrop-blur border-b-2 border-[#161a33] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.ADMIN}
              className="p-1.5 bg-[#10142e] border border-[#1e2448] text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
              title="Return to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-pixel text-xs sm:text-sm text-white tracking-wider">
                {isNew ? 'CREATE FTC ENGINEERING PORTFOLIO' : `EDIT PORTFOLIO: FTC #${teamNumber}`}
              </h1>
              <p className="text-[10px] text-slate-400">
                Connected to RoboLads backend &amp; public repository
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.ADMIN}
              className="px-3 py-1.5 bg-[#10142e] border border-[#1e2448] text-slate-300 text-xs hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-1.5 bg-amber-400 text-black text-xs font-pixel font-bold flex items-center gap-1.5 shadow-[2px_2px_0_#000000] hover:bg-amber-300 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isNew ? 'PUBLISH PORTFOLIO' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 pt-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs flex items-center gap-2 shadow-[2px_2px_0_#000000]">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 text-xs flex items-center gap-2 shadow-[2px_2px_0_#000000]">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Team & Season Metadata */}
          <div className="p-6 bg-[#0e1023] border-2 border-[#1e2448] shadow-[3px_3px_0_#000000]">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#1e2448]">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="font-pixel text-xs text-white uppercase tracking-wider">
                1. Team Profile &amp; Challenge Season
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Team Number *</label>
                <input
                  type="text"
                  value={teamNumber}
                  onChange={(e) => setTeamNumber(e.target.value)}
                  placeholder="e.g. 7444 or 31113"
                  required
                  className="w-full px-3 py-2 bg-[#050610] border-2 border-[#1e2448] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Sisters of the Motherboard"
                  required
                  className="w-full px-3 py-2 bg-[#050610] border-2 border-[#1e2448] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Competition Season *</label>
                <input
                  type="text"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="e.g. Ultimate Goal (2020-21) or Decode"
                  required
                  className="w-full px-3 py-2 bg-[#050610] border-2 border-[#1e2448] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">School / Organization</label>
                <input
                  type="text"
                  value={schoolOrOrg}
                  onChange={(e) => setSchoolOrOrg(e.target.value)}
                  placeholder="e.g. Salem Academy"
                  className="w-full px-3 py-2 bg-[#050610] border-2 border-[#1e2448] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Location (City, Country)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Winston-Salem, NC, USA"
                  className="w-full px-3 py-2 bg-[#050610] border-2 border-[#1e2448] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Notable Mechanisms (tags)</label>
                <input
                  type="text"
                  value={mechanisms}
                  onChange={(e) => setMechanisms(e.target.value)}
                  placeholder="Comma separated: Pasta Roller Intake, Lead Screw..."
                  className="w-full px-3 py-2 bg-[#050610] border-2 border-[#1e2448] text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Portfolio PDF Document Asset */}
          <div className="p-6 bg-[#0e1023] border-2 border-[#1e2448] shadow-[3px_3px_0_#000000]">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#1e2448]">
              <FileText className="w-4 h-4 text-sky-400" />
              <h2 className="font-pixel text-xs text-white uppercase tracking-wider">
                2. Portfolio PDF Document (15-Page Specification)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-2 font-bold">Upload Portfolio PDF File *</label>
                <div className="p-6 border-2 border-dashed border-[#2b3366] bg-[#050610] hover:border-amber-400/70 transition-colors flex flex-col items-center justify-center text-center">
                  <Upload className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs text-slate-200 font-bold mb-1">
                    Select official FTC Engineering Portfolio PDF
                  </p>
                  <p className="text-[10px] text-slate-400 mb-3">
                    Supported: PDF files up to 50MB (strictly 15 pages max per FTC rules)
                  </p>

                  <label className="px-4 py-2 bg-amber-400 text-black text-xs font-pixel font-bold cursor-pointer hover:bg-amber-300 shadow-[2px_2px_0_#000000] transition-colors inline-flex items-center gap-2">
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                    <span>{isUploading ? 'UPLOADING...' : 'CHOOSE PDF FILE'}</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {pdfUrl && (
                  <div className="mt-3 p-3 bg-stone-900 border border-emerald-500/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate text-emerald-300">
                      <Check className="w-4 h-4 shrink-0" />
                      <span className="truncate">File ready: {pdfUrl}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[10px]">
                      <span>{fileSize}</span>
                      <span>•</span>
                      <span>{pageCount} Pages</span>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Manual PDF URL Fallback</label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="/portfolios/7444-ug.pdf"
                  className="w-full px-3 py-2 bg-[#050610] border-2 border-[#1e2448] text-white focus:outline-none focus:border-amber-400 mb-3"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px]">Page Count</label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={pageCount}
                      onChange={(e) => setPageCount(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-[#050610] border border-[#1e2448] text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px]">File Size</label>
                    <input
                      type="text"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      placeholder="1.36 MB"
                      className="w-full px-2 py-1.5 bg-[#050610] border border-[#1e2448] text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Major Awards Won */}
          <div className="p-6 bg-[#0e1023] border-2 border-[#1e2448] shadow-[3px_3px_0_#000000]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1e2448]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h2 className="font-pixel text-xs text-white uppercase tracking-wider">
                  3. Major Awards Won
                </h2>
              </div>
              <button
                type="button"
                onClick={addAward}
                className="px-2.5 py-1 bg-[#10142e] border border-amber-400/50 text-amber-300 text-xs hover:bg-[#1a214d] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Award</span>
              </button>
            </div>

            <div className="space-y-3">
              {awards.map((award, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#050610] border border-[#1e2448] flex flex-col sm:flex-row items-center gap-3 text-xs"
                >
                  <div className="w-full sm:w-1/3">
                    <input
                      type="text"
                      value={award.name}
                      onChange={(e) => updateAward(idx, { name: e.target.value })}
                      placeholder="e.g. Inspire Award Winner"
                      className="w-full px-2.5 py-1.5 bg-[#0e1023] border border-[#2b3366] text-white"
                    />
                  </div>
                  <div className="w-full sm:w-1/3">
                    <select
                      value={award.type}
                      onChange={(e) => updateAward(idx, { type: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-[#0e1023] border border-[#2b3366] text-white"
                    >
                      {AWARD_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-1/3 flex items-center gap-2">
                    <input
                      type="text"
                      value={award.level || ''}
                      onChange={(e) => updateAward(idx, { level: e.target.value })}
                      placeholder="e.g. World / Regional / State"
                      className="flex-1 px-2.5 py-1.5 bg-[#0e1023] border border-[#2b3366] text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeAward(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-400 cursor-pointer shrink-0"
                      title="Remove award"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Fast-Read Executive Summary */}
          <div className="p-6 bg-[#0e1023] border-2 border-[#1e2448] shadow-[3px_3px_0_#000000]">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#1e2448]">
              <Layers className="w-4 h-4 text-amber-400" />
              <h2 className="font-pixel text-xs text-white uppercase tracking-wider">
                4. Fast-Read Executive Summary (No-Read-All-15-Pages Feature)
              </h2>
            </div>

            {/* High-level Overview */}
            <div className="mb-6 text-xs">
              <label className="block text-slate-300 mb-1.5 font-bold">
                1-2 Sentence Executive Overview *
              </label>
              <textarea
                rows={2}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Brief high-level description of team philosophy, robot achievements, and season trajectory..."
                className="w-full px-3 py-2 bg-[#050610] border-2 border-[#1e2448] text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Outreach Bullet Points */}
            <div className="mb-6 text-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sky-300 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Outreach &amp; Connecting Highlights</span>
                </label>
                <button
                  type="button"
                  onClick={() => addBullet(setOutreachBullets)}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Bullet</span>
                </button>
              </div>
              <div className="space-y-2">
                {outreachBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs">▶</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => updateBullet(setOutreachBullets, idx, e.target.value)}
                      placeholder="e.g. Sister team mentorship, Girl Scouts coding workshops..."
                      className="flex-1 px-3 py-1.5 bg-[#050610] border border-[#1e2448] text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(setOutreachBullets, idx)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Bullet Points */}
            <div className="mb-6 text-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Technical Subsystems &amp; CAD Highlights</span>
                </label>
                <button
                  type="button"
                  onClick={() => addBullet(setTechnicalBullets)}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Bullet</span>
                </button>
              </div>
              <div className="space-y-2">
                {technicalBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs">▶</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => updateBullet(setTechnicalBullets, idx, e.target.value)}
                      placeholder="e.g. Pasta roller-inspired chain intake, lead screw pitch elevation..."
                      className="flex-1 px-3 py-1.5 bg-[#050610] border border-[#1e2448] text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(setTechnicalBullets, idx)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Autonomous Bullet Points */}
            <div className="text-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Autonomous Navigation, Vision &amp; Strategy</span>
                </label>
                <button
                  type="button"
                  onClick={() => addBullet(setSoftwareBullets)}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Bullet</span>
                </button>
              </div>
              <div className="space-y-2">
                {softwareBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs">▶</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => updateBullet(setSoftwareBullets, idx, e.target.value)}
                      placeholder="e.g. Vision pipeline detecting ring stacks, dead-wheel odometry..."
                      className="flex-1 px-3 py-1.5 bg-[#050610] border border-[#1e2448] text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(setSoftwareBullets, idx)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#161a33]">
            <Link
              href={ROUTES.ADMIN}
              className="px-4 py-2 bg-[#10142e] border border-[#1e2448] text-slate-300 text-xs hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-amber-400 text-black text-xs font-pixel font-bold flex items-center gap-2 shadow-[2px_2px_0_#000000] hover:bg-amber-300 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isNew ? 'PUBLISH PORTFOLIO' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
