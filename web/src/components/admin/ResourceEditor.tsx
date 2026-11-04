'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/routes';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Heading2,
  Heading3,
  AlignLeft,
  AlertCircle,
  Lightbulb,
  AlertTriangle,
  Info,
  Eye,
  Edit3,
  Save,
  Loader2,
  Check,
  Upload,
  Calendar,
  ShieldCheck,
  ExternalLink,
  HardDrive,
  Box,
  FileText,
  User,
  Paperclip,
} from 'lucide-react';
import { TagManager } from './TagManager';

export type BlockType = 'h2' | 'h3' | 'paragraph' | 'image' | 'callout';
export type CalloutTone = 'important' | 'tip' | 'warning' | 'info';

export interface EditorBlock {
  id: string;
  type: BlockType;
  text?: string;
  imageUrl?: string;
  imageAssetId?: string;
  caption?: string;
  alt?: string;
  calloutTone?: CalloutTone;
  calloutTitle?: string;
  calloutText?: string;
}

export interface ResourceEditorProps {
  initialResource?: {
    _id?: string;
    title?: string;
    category?: string;
    author?: string;
    tags?: string[];
    description?: any[];
    publishedAt?: string;
    file?: {
      asset?: {
        _id?: string;
        url?: string;
        originalFilename?: string;
        extension?: string;
        mimeType?: string;
        size?: number;
      };
    };
  };
  isNew?: boolean;
}

const CATEGORIES = ['CAD', 'Programming', 'Mechanical', 'Failure Log'] as const;

function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function convertPortableTextToBlocks(description: any[]): EditorBlock[] {
  if (!Array.isArray(description) || description.length === 0) {
    return [
      { id: generateId(), type: 'h2', text: 'System Architecture & Specification' },
      { id: generateId(), type: 'paragraph', text: 'Detail the engineering specifications, mechanical tolerances, and build instructions for this asset...' },
      {
        id: generateId(),
        type: 'callout',
        calloutTone: 'important',
        calloutTitle: 'ASSEMBLY & TORQUE SPECIFICATION',
        calloutText: 'Ensure all M3 button head cap screws into aluminum 6061-T6 are torqued with medium-strength blue threadlocker.',
      },
    ];
  }

  const result: EditorBlock[] = [];

  for (const b of description) {
    if (b._type === 'callout') {
      result.push({
        id: b._key || generateId(),
        type: 'callout',
        calloutTone: (b.tone as CalloutTone) || 'important',
        calloutTitle: b.title || '',
        calloutText: b.text || '',
      });
    } else if (b._type === 'image') {
      result.push({
        id: b._key || generateId(),
        type: 'image',
        imageUrl: b.asset?.url || b.url || '',
        imageAssetId: b.asset?._ref || b.asset?._id || '',
        caption: b.caption || '',
        alt: b.alt || '',
      });
    } else if (b._type === 'block') {
      const text = (b.children || []).map((c: any) => c.text || '').join('');
      if (b.style === 'h2') {
        result.push({ id: b._key || generateId(), type: 'h2', text });
      } else if (b.style === 'h3') {
        result.push({ id: b._key || generateId(), type: 'h3', text });
      } else {
        result.push({ id: b._key || generateId(), type: 'paragraph', text });
      }
    }
  }

  if (result.length === 0) {
    result.push({ id: generateId(), type: 'paragraph', text: '' });
  }

  return result;
}

function convertBlocksToPortableText(blocks: EditorBlock[]): any[] {
  return blocks.map((b) => {
    if (b.type === 'callout') {
      return {
        _type: 'callout',
        _key: b.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || generateId(),
        tone: b.calloutTone || 'important',
        title: b.calloutTitle || '',
        text: b.calloutText || '',
      };
    }

    if (b.type === 'image') {
      return {
        _type: 'image',
        _key: b.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || generateId(),
        ...(b.imageAssetId
          ? { asset: { _type: 'reference', _ref: b.imageAssetId } }
          : b.imageUrl
          ? { url: b.imageUrl }
          : {}),
        alt: b.alt || '',
        caption: b.caption || '',
      };
    }

    const style = b.type === 'h2' ? 'h2' : b.type === 'h3' ? 'h3' : 'normal';
    return {
      _type: 'block',
      _key: b.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || generateId(),
      style,
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'span1',
          text: b.text || '',
          marks: [],
        },
      ],
    };
  });
}

export function ResourceEditor({ initialResource, isNew = false }: ResourceEditorProps) {
  const router = useRouter();

  // Mode: Editor vs Live Preview
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');

  // Resource Metadata
  const [title, setTitle] = useState(initialResource?.title || '');
  const [category, setCategory] = useState(initialResource?.category || 'Mechanical');
  const [author, setAuthor] = useState(initialResource?.author || 'RoboLads Engineering Unit');
  const [tags, setTags] = useState<string[]>(() =>
    Array.isArray(initialResource?.tags) ? initialResource.tags.map((t) => String(t).toUpperCase()) : ['CAD', 'FTC31113']
  );
  const [publishedAt, setPublishedAt] = useState(
    initialResource?.publishedAt || new Date().toISOString()
  );

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState<{
    assetId?: string;
    filename?: string;
    url?: string;
    size?: number;
    extension?: string;
  } | null>(
    initialResource?.file?.asset
      ? {
          assetId: initialResource.file.asset._id,
          filename: initialResource.file.asset.originalFilename,
          url: initialResource.file.asset.url,
          size: initialResource.file.asset.size,
          extension: initialResource.file.asset.extension,
        }
      : null
  );
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState('');

  // Rich Blocks
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    convertPortableTextToBlocks(initialResource?.description || [])
  );

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  // Block Manipulation
  const handleAddBlock = (type: BlockType, insertIndex?: number) => {
    const newBlock: EditorBlock = {
      id: generateId(),
      type,
      text: type === 'h2' ? 'New Section' : type === 'h3' ? 'Subheading' : '',
      calloutTone: 'important',
      calloutTitle: type === 'callout' ? 'CRITICAL SPECIFICATION' : undefined,
      calloutText: type === 'callout' ? '' : undefined,
    };

    if (insertIndex !== undefined) {
      const next = [...blocks];
      next.splice(insertIndex + 1, 0, newBlock);
      setBlocks(next);
    } else {
      setBlocks((prev) => [...prev, newBlock]);
    }
  };

  const handleUpdateBlock = (id: string, patch: Partial<EditorBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      setBlocks([{ id: generateId(), type: 'paragraph', text: '' }]);
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    setBlocks((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Upload inline mechanism image
  const handleImageUpload = async (blockId: string, file: File) => {
    setUploadingBlockId(blockId);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      handleUpdateBlock(blockId, {
        imageUrl: data.url,
        imageAssetId: data.assetId,
        caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        alt: file.name,
      });
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingBlockId(null);
    }
  };

  // Upload engineering file attachment (CAD, STEP, STL, PDF, ZIP)
  const handleAttachmentUpload = async (file: File) => {
    setIsUploadingFile(true);
    setFileUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-file', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload file attachment');
      }

      setAttachedFile({
        assetId: data.assetId,
        filename: data.originalFilename || file.name,
        url: data.url,
        size: data.size || file.size,
        extension: data.extension || file.name.split('.').pop() || 'file',
      });
    } catch (err: any) {
      setFileUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Save / Publish Resource
  const handleSave = async () => {
    if (!title.trim()) {
      setSaveError('Please provide a title for the resource.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const portableText = convertBlocksToPortableText(blocks);

    const payload = {
      title: title.trim(),
      category,
      author: author.trim() || 'RoboLads Engineering Unit',
      tags,
      publishedAt,
      description: portableText,
      fileAssetId: attachedFile?.assetId || null,
      removeFile: !attachedFile,
    };

    try {
      const endpoint = isNew
        ? '/api/admin/resources'
        : `/api/admin/resources/${initialResource?._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save resource asset');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.ADMIN);
      }, 900);
    } catch (err: any) {
      setSaveError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'CAD':
        return 'border-sky-400 bg-sky-950/80 text-sky-300';
      case 'Programming':
        return 'border-purple-400 bg-purple-950/80 text-purple-300';
      case 'Mechanical':
        return 'border-amber-400 bg-amber-950/80 text-amber-300';
      case 'Failure Log':
        return 'border-red-400 bg-red-950/80 text-red-300';
      default:
        return 'border-emerald-400 bg-emerald-950/80 text-emerald-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#050610] text-slate-200 flex flex-col font-mono">
      {/* Top Fixed Control Bar */}
      <header className="sticky top-0 z-50 bg-[#08081a]/95 backdrop-blur border-b-2 border-[#1e223d] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.ADMIN}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1023] hover:bg-[#1a1f3d] text-slate-300 hover:text-white border-2 border-[#1e223d] text-xs font-pixel transition-all cursor-pointer shadow-[2px_2px_0_#000000]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              BACK TO ADMIN
            </Link>

            <div className="hidden sm:block h-6 w-px bg-[#1e223d]" />

            <div>
              <span className="text-[10px] text-amber-400 font-pixel tracking-wider uppercase block">
                {isNew ? 'CREATE RESOURCE ASSET' : 'EDIT RESOURCE ASSET'}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {title || 'Untitled Engineering Asset'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex bg-[#050610] p-1 border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000]">
              <button
                type="button"
                onClick={() => setActiveView('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-pixel transition-all cursor-pointer ${
                  activeView === 'editor'
                    ? 'bg-amber-400 text-black font-bold shadow-[2px_2px_0_#000000]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                EDITOR
              </button>
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-pixel transition-all cursor-pointer ${
                  activeView === 'preview'
                    ? 'bg-cyan-400 text-black font-bold shadow-[2px_2px_0_#000000]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                LIVE PREVIEW
              </button>
            </div>

            {/* Save / Publish Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-pixel font-bold shadow-[3px_3px_0_#000000] border-2 transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-400 border-emerald-300 text-black'
                  : 'bg-amber-400 hover:bg-amber-300 border-amber-300 text-black'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  SAVING...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  SAVED!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {isNew ? 'PUBLISH ASSET' : 'UPDATE ASSET'}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {saveError && (
          <div className="mb-6 bg-red-950/80 border-2 border-red-500 text-red-200 p-4 shadow-[4px_4px_0_#000000] flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              {saveError}
            </span>
            <button onClick={() => setSaveError('')} className="text-red-400 hover:text-white font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {activeView === 'editor' ? (
          /* =========================================================================
             EDITOR VIEW: FORM METADATA + ATTACHMENT + BLOCK BUILDER
             ========================================================================= */
          <div className="space-y-8">
            {/* Card 1: Asset Metadata & File Download */}
            <section className="bg-[#0e1023] border-3 border-[#1e223d] shadow-[6px_6px_0_#000000] p-6">
              <h2 className="text-xs font-pixel text-amber-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                ASSET METADATA &amp; ENGINEERING PACKAGE
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1.5 uppercase">
                    RESOURCE ASSET TITLE <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. DecodeBot V1: Full Onshape 3D CAD Assembly & STEP Files"
                    className="w-full bg-[#050610] border-2 border-[#1e223d] focus:border-amber-400 px-3.5 py-2.5 text-sm text-white font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1.5 uppercase">
                    CATEGORY DISCIPLINE
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#050610] border-2 border-[#1e223d] focus:border-amber-400 px-3.5 py-2.5 text-sm text-white font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1.5 uppercase">
                    AUTHOR / SUB-UNIT
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. RoboLads CAD Unit"
                    className="w-full bg-[#050610] border-2 border-[#1e223d] focus:border-amber-400 px-3.5 py-2.5 text-sm text-white font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1.5 uppercase">
                    PUBLISH DATE
                  </label>
                  <input
                    type="datetime-local"
                    value={publishedAt ? publishedAt.slice(0, 16) : ''}
                    onChange={(e) => setPublishedAt(new Date(e.target.value).toISOString())}
                    className="w-full bg-[#050610] border-2 border-[#1e223d] focus:border-amber-400 px-3.5 py-2.5 text-sm text-white font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Interactive Tag Manager */}
                <div className="md:col-span-2">
                  <TagManager
                    tags={tags}
                    onChange={setTags}
                    label="RESOURCE SEARCH &amp; ENGINEERING TAGS"
                    placeholder="Type new engineering tag (e.g. OSHW, STEP, PIDF) and press Enter..."
                    presetSuggestions={[
                      'CAD',
                      'STEP',
                      'ONSHAPE',
                      'SOLIDWORKS',
                      '3D PRINT',
                      'CNC',
                      'ALUMINUM 6061',
                      'ODOMETRY',
                      'ROADRUNNER',
                      'PEDRO PATHING',
                      'PIDF',
                      'RIGGING',
                      'CF SPRING',
                      'UHMWPE',
                      'FAILURE LOG',
                      'FEA',
                    ]}
                  />
                </div>

                {/* Attachment File Slot */}
                <div className="md:col-span-2 pt-4 border-t-2 border-[#1e223d]">
                  <label className="block text-[11px] font-pixel text-slate-300 mb-2 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      DOWNLOADABLE CAD / ASSET ARCHIVE (STEP, STL, DXF, PDF, ZIP)
                    </span>
                    <span className="text-[9px] text-slate-500 font-normal">MAX 100MB</span>
                  </label>

                  {fileUploadError && (
                    <p className="text-xs text-red-400 mb-2">{fileUploadError}</p>
                  )}

                  {attachedFile ? (
                    <div className="bg-[#050610] border-2 border-cyan-400/60 p-4 shadow-[inset_2px_2px_0_#000000] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-950/80 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs font-pixel shadow-[2px_2px_0_#000000]">
                          {(attachedFile.extension || 'FILE').toUpperCase().slice(0, 4)}
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold font-mono break-all">
                            {attachedFile.filename || 'asset-package.zip'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {attachedFile.size ? `${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Sanity Asset'}
                            {attachedFile.url && (
                              <a
                                href={attachedFile.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline ml-2 inline-flex items-center gap-1"
                              >
                                Test Download <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 bg-[#0e1023] hover:bg-[#1a1f3d] text-cyan-400 border border-cyan-400/50 text-[10px] font-pixel cursor-pointer transition-colors shadow-[2px_2px_0_#000000]">
                          REPLACE FILE
                          <input
                            type="file"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleAttachmentUpload(f);
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 text-[10px] font-pixel cursor-pointer transition-colors shadow-[2px_2px_0_#000000]"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#1e223d] hover:border-cyan-400 bg-[#050610] p-6 text-center cursor-pointer block transition-colors shadow-[inset_2px_2px_0_#000000]">
                      <input
                        type="file"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleAttachmentUpload(f);
                        }}
                        disabled={isUploadingFile}
                        className="hidden"
                      />
                      {isUploadingFile ? (
                        <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-pixel">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          UPLOADING ASSET PACKAGE TO REPOSITORY...
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs font-pixel text-white">CLICK OR DRAG FILE HERE TO ATTACH</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Supported: .STEP, .STL, .DXF, .SLDPRT, .PDF, .ZIP, .JAVA
                          </p>
                        </div>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </section>

            {/* Card 2: Rich Specification Content Blocks */}
            <section className="bg-[#0e1023] border-3 border-[#1e223d] shadow-[6px_6px_0_#000000] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#1e223d]">
                <div>
                  <h2 className="text-xs font-pixel text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    RICH SPECIFICATION &amp; TECHNICAL DOCUMENTATION
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Assemble technical chapters, engineering tolerances, inline mechanism schematics, and callout boxes.
                  </p>
                </div>

                {/* Quick Add Toolbar */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddBlock('h2')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08081a] hover:bg-[#1a1f3d] text-amber-300 border border-amber-400/50 text-[10px] font-pixel shadow-[2px_2px_0_#000000] cursor-pointer"
                  >
                    <Heading2 className="w-3.5 h-3.5" /> + HEADER
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('paragraph')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08081a] hover:bg-[#1a1f3d] text-slate-200 border border-slate-600 text-[10px] font-pixel shadow-[2px_2px_0_#000000] cursor-pointer"
                  >
                    <AlignLeft className="w-3.5 h-3.5" /> + PARAGRAPH
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('image')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08081a] hover:bg-[#1a1f3d] text-cyan-300 border border-cyan-400/50 text-[10px] font-pixel shadow-[2px_2px_0_#000000] cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> + IMAGE / DIAGRAM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('callout')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08081a] hover:bg-[#1a1f3d] text-amber-400 border border-amber-400/50 text-[10px] font-pixel shadow-[2px_2px_0_#000000] cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> + INFO BOX
                  </button>
                </div>
              </div>

              {/* Block List */}
              <div className="space-y-4">
                {blocks.map((block, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === blocks.length - 1;

                  return (
                    <div
                      key={block.id}
                      className="bg-[#050610] border-2 border-[#1e223d] p-4 shadow-[4px_4px_0_#000000] transition-all hover:border-[#2d335c]"
                    >
                      {/* Block Controls Header */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#14182f] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-[9px] px-2 py-0.5 bg-[#0e1023] text-amber-400 border border-[#1e223d]">
                            #{idx + 1}
                          </span>
                          <span className="font-pixel text-[10px] text-slate-300 uppercase">
                            {block.type === 'h2' && 'CHAPTER HEADER (H2)'}
                            {block.type === 'h3' && 'SUBHEADING (H3)'}
                            {block.type === 'paragraph' && 'PARAGRAPH'}
                            {block.type === 'image' && 'INLINE IMAGE / SCHEMATIC'}
                            {block.type === 'callout' && 'INFO / CALLOUT BOX'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(idx, 'up')}
                            disabled={isFirst}
                            title="Move block up"
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(idx, 'down')}
                            disabled={isLast}
                            title="Move block down"
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(block.id)}
                            title="Delete block"
                            className="p-1 text-slate-400 hover:text-red-400 cursor-pointer ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Block Contents */}
                      {block.type === 'h2' && (
                        <div>
                          <input
                            type="text"
                            value={block.text || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                            placeholder="Enter main section heading..."
                            className="w-full bg-[#08081a] border-2 border-[#1e223d] focus:border-amber-400 px-3.5 py-2 text-base font-bold text-white font-heading shadow-[inset_2px_2px_0_#000000] focus:outline-none"
                          />
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                            <span>Main section title (renders with amber bar)</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateBlock(block.id, { type: 'h3' })}
                              className="text-amber-400 hover:underline cursor-pointer"
                            >
                              Switch to H3 Subheading
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === 'h3' && (
                        <div>
                          <input
                            type="text"
                            value={block.text || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                            placeholder="Enter subsection heading..."
                            className="w-full bg-[#08081a] border-2 border-[#1e223d] focus:border-amber-400 px-3 py-1.5 text-sm font-bold text-slate-200 font-heading shadow-[inset_2px_2px_0_#000000] focus:outline-none"
                          />
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                            <span>Subsection title</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateBlock(block.id, { type: 'h2' })}
                              className="text-amber-400 hover:underline cursor-pointer"
                            >
                              Switch to H2 Header
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === 'paragraph' && (
                        <div>
                          <textarea
                            value={block.text || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                            rows={3}
                            placeholder="Write technical specifications, assembly steps, material tolerances, or post-mortem notes..."
                            className="w-full bg-[#08081a] border-2 border-[#1e223d] focus:border-amber-400 p-3 text-xs text-slate-200 font-mono leading-relaxed shadow-[inset_2px_2px_0_#000000] focus:outline-none resize-y"
                          />
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                            <span>Standard Paragraph Block</span>
                            <span>{block.text?.length || 0} characters</span>
                          </div>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                                UPLOAD PHOTO / DIAGRAM
                              </label>
                              <label className="flex items-center justify-center gap-2 p-3 bg-[#08081a] hover:bg-[#141833] border-2 border-dashed border-[#1e223d] hover:border-cyan-400 text-xs text-cyan-300 font-pixel cursor-pointer transition-colors shadow-[inset_2px_2px_0_#000000]">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(block.id, file);
                                  }}
                                  disabled={uploadingBlockId === block.id}
                                  className="hidden"
                                />
                                {uploadingBlockId === block.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    UPLOADING IMAGE...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5" />
                                    CHOOSE IMAGE FILE
                                  </>
                                )}
                              </label>
                            </div>

                            <div>
                              <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                                OR IMAGE URL (EXTERNAL / STATIC)
                              </label>
                              <input
                                type="text"
                                value={block.imageUrl || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { imageUrl: e.target.value })}
                                placeholder="https://... or /Photo/cad-robot.png"
                                className="w-full bg-[#08081a] border-2 border-[#1e223d] focus:border-cyan-400 px-3 py-2 text-xs text-slate-200 font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Image Preview Thumbnail */}
                          {block.imageUrl ? (
                            <div className="relative bg-[#020208] p-2 border border-[#1e223d] flex items-center justify-center max-h-56 overflow-hidden">
                              <img
                                src={block.imageUrl}
                                alt={block.alt || 'Asset schematic'}
                                className="max-h-48 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="bg-[#08081a] border border-[#1e223d] p-3 text-center text-slate-500 text-[10px] font-pixel">
                              No image selected yet
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                                CAPTION (SHOWN DIRECTLY UNDER IMAGE)
                              </label>
                              <input
                                type="text"
                                value={block.caption || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                                placeholder="e.g. FIG 1: Odometry deadwheel spring suspension assembly"
                                className="w-full bg-[#08081a] border-2 border-[#1e223d] focus:border-amber-400 px-3 py-1.5 text-xs text-slate-200 font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-pixel text-slate-400 mb-1">
                                ALT TEXT (SCREEN READERS / SEO)
                              </label>
                              <input
                                type="text"
                                value={block.alt || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { alt: e.target.value })}
                                placeholder="e.g. RoboLads robot drivetrain assembly"
                                className="w-full bg-[#08081a] border-2 border-[#1e223d] focus:border-amber-400 px-3 py-1.5 text-xs text-slate-200 font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === 'callout' && (
                        <div className="space-y-3">
                          {/* Tone selector */}
                          <div>
                            <label className="block text-[10px] font-pixel text-slate-400 mb-1.5">
                              BOX TONE:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {(
                                [
                                  { tone: 'important', label: '⚡ Important', color: 'border-amber-400 text-amber-300' },
                                  { tone: 'tip', label: '💡 Engineering Tip', color: 'border-emerald-400 text-emerald-300' },
                                  { tone: 'warning', label: '⚠️ Warning', color: 'border-red-400 text-red-300' },
                                  { tone: 'info', label: '📘 Tech Spec', color: 'border-cyan-400 text-cyan-300' },
                                ] as const
                              ).map((t) => (
                                <button
                                  key={t.tone}
                                  type="button"
                                  onClick={() => handleUpdateBlock(block.id, { calloutTone: t.tone })}
                                  className={`px-2.5 py-1.5 border-2 text-[10px] font-pixel transition-all cursor-pointer ${
                                    block.calloutTone === t.tone
                                      ? `${t.color} bg-[#121633] font-bold shadow-[2px_2px_0_#000000]`
                                      : 'border-[#1e223d] text-slate-400 hover:text-slate-200 hover:bg-[#0c0d1e]'
                                  }`}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Callout Title */}
                          <div>
                            <input
                              type="text"
                              value={block.calloutTitle || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { calloutTitle: e.target.value })}
                              placeholder="Box Header (e.g. CRITICAL FASTENER TORQUE SPECIFICATION)"
                              className="w-full bg-[#08081a] border-2 border-[#1e223d] focus:border-amber-400 px-3 py-1.5 text-xs font-bold text-white font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none"
                            />
                          </div>

                          {/* Callout Text */}
                          <div>
                            <textarea
                              value={block.calloutText || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { calloutText: e.target.value })}
                              rows={2}
                              placeholder="Write the highlight text, critical rule, key specification, or key engineering observation..."
                              className="w-full bg-[#08081a] border-2 border-[#1e223d] focus:border-amber-400 p-3 text-xs text-slate-200 font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none resize-y"
                            />
                          </div>

                          {/* Mini Callout Preview */}
                          <div
                            className={`p-3 border-2 font-mono text-xs ${
                              block.calloutTone === 'warning'
                                ? 'bg-red-950/30 border-red-500 text-red-200'
                                : block.calloutTone === 'tip'
                                ? 'bg-emerald-950/30 border-emerald-400 text-emerald-200'
                                : block.calloutTone === 'info'
                                ? 'bg-cyan-950/30 border-cyan-400 text-cyan-200'
                                : 'bg-amber-950/30 border-amber-400 text-amber-200'
                            }`}
                          >
                            <span className="font-pixel text-[9px] uppercase tracking-wider block font-bold mb-1">
                              {block.calloutTitle || 'HIGHLIGHT NOTICE'}
                            </span>
                            <p className="text-xs leading-relaxed opacity-90">
                              {block.calloutText || 'Preview text will appear here...'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Insert Below Bar */}
                      <div className="mt-3 pt-3 border-t border-[#14182f] flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-pixel">
                        <span>+ INSERT BELOW:</span>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('paragraph', idx)}
                          className="hover:text-amber-300 cursor-pointer"
                        >
                          Paragraph
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('h2', idx)}
                          className="hover:text-amber-300 cursor-pointer"
                        >
                          H2
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('image', idx)}
                          className="hover:text-cyan-300 cursor-pointer"
                        >
                          Image
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('callout', idx)}
                          className="hover:text-amber-300 cursor-pointer"
                        >
                          Info Box
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Add Footer */}
              <div className="mt-6 pt-6 border-t-2 border-[#1e223d] text-center">
                <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-wider block mb-3">
                  ADD NEXT SECTION TO YOUR ASSET:
                </span>
                <div className="inline-flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddBlock('h2')}
                    className="px-4 py-2 bg-[#08081a] hover:bg-amber-400 hover:text-black text-amber-300 border-2 border-amber-400/50 text-xs font-pixel shadow-[3px_3px_0_#000000] cursor-pointer transition-colors"
                  >
                    + CHAPTER HEADER (H2)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('paragraph')}
                    className="px-4 py-2 bg-[#08081a] hover:bg-slate-200 hover:text-black text-slate-200 border-2 border-slate-600 text-xs font-pixel shadow-[3px_3px_0_#000000] cursor-pointer transition-colors"
                  >
                    + PARAGRAPH
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('image')}
                    className="px-4 py-2 bg-[#08081a] hover:bg-cyan-400 hover:text-black text-cyan-300 border-2 border-cyan-400/50 text-xs font-pixel shadow-[3px_3px_0_#000000] cursor-pointer transition-colors"
                  >
                    + INLINE SCHEMATIC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('callout')}
                    className="px-4 py-2 bg-[#08081a] hover:bg-amber-400 hover:text-black text-amber-400 border-2 border-amber-400/50 text-xs font-pixel shadow-[3px_3px_0_#000000] cursor-pointer transition-colors"
                  >
                    + INFO / CALLOUT BOX
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* =========================================================================
             LIVE PREVIEW TAB: 1:1 RENDER ON RESOURCE DETAIL CARD
             ========================================================================= */
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 text-xs font-pixel text-cyan-400 flex items-center justify-between">
              <span>LIVE RESOURCE DETAIL PREVIEW</span>
              <span className="text-slate-400">1:1 MATCHING /resources/[id]</span>
            </div>

            <div className="bg-[#121526] border-4 border-[#1e223d] shadow-[8px_8px_0_#000000] p-6 sm:p-8">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span
                  className={`font-display text-[9px] px-3 py-1 border-2 uppercase tracking-wider ${getCategoryColor(
                    category
                  )}`}
                >
                  {category || 'GENERAL'}
                </span>

                <span className="text-xs text-slate-300 flex items-center gap-1.5 font-body bg-stone-900 px-2.5 py-1 border border-stone-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>

                <span className="text-xs text-slate-300 flex items-center gap-1.5 font-body bg-stone-900 px-2.5 py-1 border border-stone-700">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  {author || 'RoboLads Engineering Unit'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-heading text-white tracking-tight leading-snug">
                {title || 'Untitled Engineering Asset'}
              </h1>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 bg-stone-900 border border-stone-700 text-slate-300 font-display text-[9px]"
                    >
                      #{tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              {/* Special CAD Action Banner */}
              {category === 'CAD' && (
                <div className="mt-6 p-4 bg-sky-950/40 border-2 border-sky-400 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-900 border border-sky-400 text-sky-300 flex items-center justify-center shadow-[2px_2px_0_#000000]">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm text-white">INTERACTIVE 3D CAD INSPECTION</h3>
                      <p className="text-xs text-slate-300 font-body">Rotate, exploded-view, and inspect telemetry in our WebGL lab.</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-amber-400 text-black font-pixel text-xs font-bold border-2 border-amber-300 shadow-[3px_3px_0_#000000]">
                    LAUNCH 3D LAB ⛶
                  </span>
                </div>
              )}

              {/* Download Slot */}
              <div className="mt-8 bg-stone-900 border-2 border-stone-700 shadow-[inset_2px_2px_0_#000000] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-stone-800 border-2 border-amber-400/70 text-amber-400 flex items-center justify-center shadow-[2px_2px_0_#000000]">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-heading text-white text-sm break-all">
                      {attachedFile?.filename || `${(title || 'asset-package').replace(/\s+/g, '_')}.zip`}
                    </p>
                    <p className="text-xs text-slate-400 font-display text-[8px] mt-0.5">
                      FORMAT: {attachedFile?.extension?.toUpperCase() || 'ZIP / CAD'}
                      {attachedFile?.size ? ` • ${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB` : ' • OFFICIAL TEAM DISTRIBUTION'}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-2.5 bg-amber-400 text-black font-pixel text-xs font-bold border-2 border-amber-300 shadow-[3px_3px_0_#000000] flex items-center gap-2">
                  DOWNLOAD PACKAGE ⭳
                </div>
              </div>

              {/* Detailed Content / Specification */}
              <div className="mt-8 pt-8 border-t-2 border-stone-700">
                <div className="font-display text-xs text-amber-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  SPECIFICATION &amp; TECHNICAL NOTES
                </div>

                <div className="space-y-6 text-slate-200">
                  {blocks.map((b) => {
                    if (b.type === 'h2') {
                      return (
                        <h2
                          key={b.id}
                          className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide pt-4 border-l-4 border-amber-400 pl-3 mt-6"
                        >
                          {b.text || 'Section Header'}
                        </h2>
                      );
                    }
                    if (b.type === 'h3') {
                      return (
                        <h3
                          key={b.id}
                          className="text-lg font-bold font-heading text-amber-300 pt-2 tracking-wide mt-4"
                        >
                          {b.text || 'Subheading'}
                        </h3>
                      );
                    }
                    if (b.type === 'paragraph') {
                      return (
                        <p
                          key={b.id}
                          className="text-slate-300 font-body text-sm sm:text-base leading-relaxed"
                        >
                          {b.text}
                        </p>
                      );
                    }
                    if (b.type === 'image') {
                      return (
                        <figure key={b.id} className="my-6">
                          <div className="bg-[#050610] p-2 border-2 border-stone-700 shadow-[4px_4px_0_#000000]">
                            {b.imageUrl ? (
                              <img
                                src={b.imageUrl}
                                alt={b.alt || 'Asset schematic'}
                                className="w-full max-h-96 object-contain mx-auto"
                              />
                            ) : (
                              <div className="h-48 bg-stone-900 flex items-center justify-center text-slate-500 font-pixel text-xs">
                                [Mechanism Image Placeholder]
                              </div>
                            )}
                          </div>
                          {b.caption && (
                            <figcaption className="text-center text-xs text-slate-400 font-display text-[9px] mt-2 tracking-wider">
                              {b.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }
                    if (b.type === 'callout') {
                      const tone = b.calloutTone || 'important';
                      const styles =
                        tone === 'warning'
                          ? {
                              bg: 'bg-red-950/40',
                              border: 'border-red-400',
                              text: 'text-red-200',
                              badgeBg: 'bg-red-900',
                              badgeText: 'text-red-200',
                              badge: 'WARNING',
                              icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
                            }
                          : tone === 'tip'
                          ? {
                              bg: 'bg-emerald-950/40',
                              border: 'border-emerald-400',
                              text: 'text-emerald-200',
                              badgeBg: 'bg-emerald-900',
                              badgeText: 'text-emerald-200',
                              badge: 'ENGINEERING TIP',
                              icon: <Lightbulb className="w-4 h-4 text-emerald-400" />,
                            }
                          : tone === 'info'
                          ? {
                              bg: 'bg-cyan-950/40',
                              border: 'border-cyan-400',
                              text: 'text-cyan-200',
                              badgeBg: 'bg-cyan-900',
                              badgeText: 'text-cyan-200',
                              badge: 'TECH SPEC',
                              icon: <Info className="w-4 h-4 text-cyan-400" />,
                            }
                          : {
                              bg: 'bg-amber-950/40',
                              border: 'border-amber-400',
                              text: 'text-amber-200',
                              badgeBg: 'bg-amber-900',
                              badgeText: 'text-amber-200',
                              badge: 'IMPORTANT',
                              icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
                            };

                      return (
                        <div
                          key={b.id}
                          className={`my-6 p-4 border-2 ${styles.border} ${styles.bg} shadow-[4px_4px_0_#000000]`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {styles.icon}
                            <span
                              className={`text-[9px] font-pixel font-bold px-2 py-0.5 border border-current ${styles.badgeBg} ${styles.badgeText}`}
                            >
                              {styles.badge}
                            </span>
                            {b.calloutTitle && (
                              <h4 className="font-heading text-sm text-white tracking-wide">
                                {b.calloutTitle}
                              </h4>
                            )}
                          </div>
                          <p className={`text-xs sm:text-sm font-body leading-relaxed ${styles.text} pl-6`}>
                            {b.calloutText}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* Team Verification Footer */}
              <div className="mt-8 pt-6 border-t-2 border-stone-700 flex items-center justify-between text-xs text-slate-400 font-body">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verified by FTC 31113 Technical Lead
                </span>
                <span className="font-display text-[8px] text-slate-500">ID: {initialResource?._id || 'DRAFT_SPEC'}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
