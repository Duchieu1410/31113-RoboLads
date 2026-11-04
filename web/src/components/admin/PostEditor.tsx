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
} from 'lucide-react';
import { TagManager } from './TagManager';

export type BlockType = 'h2' | 'h3' | 'paragraph' | 'image' | 'callout';
export type CalloutTone = 'important' | 'tip' | 'warning' | 'info';

export interface EditorBlock {
  id: string; // client unique ID for keys and reordering
  type: BlockType;
  // For h2, h3, paragraph:
  text?: string;
  // For image:
  imageUrl?: string;
  imageAssetId?: string;
  caption?: string;
  alt?: string;
  // For callout:
  calloutTone?: CalloutTone;
  calloutTitle?: string;
  calloutText?: string;
}

export interface PostEditorProps {
  initialPost?: {
    _id?: string;
    title?: string;
    slug?: { current?: string };
    author?: string;
    category?: string;
    tags?: string[];
    excerpt?: string;
    body?: any[];
  };
  isNew?: boolean;
}

function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function convertPortableTextToBlocks(body: any[]): EditorBlock[] {
  if (!Array.isArray(body) || body.length === 0) {
    return [
      { id: generateId(), type: 'h2', text: 'Introduction & Overview' },
      { id: generateId(), type: 'paragraph', text: 'Write the opening paragraph of your dispatch here...' },
    ];
  }

  const result: EditorBlock[] = [];

  for (const b of body) {
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

  return result.length > 0 ? result : [
    { id: generateId(), type: 'paragraph', text: '' },
  ];
}

function convertBlocksToPortableText(blocks: EditorBlock[]): any[] {
  return blocks.map((b) => {
    if (b.type === 'callout') {
      return {
        _type: 'callout',
        _key: b.id,
        tone: b.calloutTone || 'important',
        title: b.calloutTitle || '',
        text: b.calloutText || '',
      };
    }

    if (b.type === 'image') {
      return {
        _type: 'image',
        _key: b.id,
        ...(b.imageAssetId
          ? {
              asset: {
                _type: 'reference',
                _ref: b.imageAssetId,
              },
            }
          : {}),
        url: b.imageUrl || '',
        caption: b.caption || '',
        alt: b.alt || b.caption || '',
      };
    }

    // Text block (h2, h3, or normal paragraph)
    return {
      _type: 'block',
      _key: b.id,
      style: b.type === 'h2' ? 'h2' : b.type === 'h3' ? 'h3' : 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: `${b.id}-span`,
          text: b.text || '',
          marks: [],
        },
      ],
    };
  });
}

const CATEGORIES = [
  'Season Update',
  'CAD & Fabrication',
  'Programming & Control',
  'Workshop & Training',
  'Community Outreach',
  'Tournament & Scrimmage',
];

export function PostEditor({ initialPost, isNew = false }: PostEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug?.current || '');
  const [author, setAuthor] = useState(initialPost?.author || 'HSGS RoboLads Team');
  const [category, setCategory] = useState(initialPost?.category || 'Season Update');
  const [tags, setTags] = useState<string[]>(() =>
    Array.isArray(initialPost?.tags) ? initialPost.tags.map((t) => String(t).toUpperCase()) : ['SEASON 2026', 'FTC31113']
  );
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    convertPortableTextToBlocks(initialPost?.body || [])
  );

  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  // Auto-slugify on title changes if slug is untouched
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialPost?.slug?.current));

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Block management
  const addBlock = (type: BlockType, insertIndex?: number) => {
    const newBlock: EditorBlock = {
      id: generateId(),
      type,
      text: '',
      calloutTone: 'important',
      calloutTitle: type === 'callout' ? 'IMPORTANT NOTICE' : undefined,
      calloutText: '',
      caption: '',
      alt: '',
      imageUrl: '',
    };

    setBlocks((prev) => {
      if (insertIndex !== undefined && insertIndex >= 0 && insertIndex < prev.length) {
        const next = [...prev];
        next.splice(insertIndex + 1, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  };

  const updateBlock = (id: string, updates: Partial<EditorBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Image Upload handler
  const handleImageUpload = async (blockId: string, file: File) => {
    if (!file) return;
    setUploadingBlockId(blockId);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.set('file', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image asset');
      }

      updateBlock(blockId, {
        imageUrl: data.url,
        imageAssetId: data.assetId,
        alt: file.name.replace(/\.[^/.]+$/, ''),
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload error');
    } finally {
      setUploadingBlockId(null);
    }
  };

  // Submit Post to Backend
  const handleSavePost = async () => {
    if (!title.trim()) {
      setErrorMessage('Post Title is required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        author: author.trim(),
        category: category.trim(),
        tags,
        excerpt: excerpt.trim(),
        body: convertBlocksToPortableText(blocks),
      };

      const url = isNew
        ? '/api/admin/posts'
        : `/api/admin/posts/${initialPost?._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save post to backend');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving the post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08081a] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation & Actions Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0c1e] border-b-3 border-[#1e223d] px-6 py-4 flex items-center justify-between shadow-[0_4px_0_#000000]">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-1.5 bg-[#050610] hover:bg-stone-900 border-2 border-[#1e223d] hover:border-amber-400 font-pixel text-[9px] text-slate-300 hover:text-amber-400 shadow-[2px_2px_0_#000] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ADMIN</span>
          </Link>

          <div>
            <span className="font-pixel text-[10px] text-amber-400 uppercase tracking-wider block">
              {isNew ? 'CREATE DISPATCH' : 'EDIT DISPATCH'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {title.trim() ? title : 'Untitled Draft Post'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Editor / Preview Tab Switcher */}
          <div className="flex bg-[#050610] p-1 border-2 border-[#1e223d] shadow-[2px_2px_0_#000]">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-pixel uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'editor'
                  ? 'bg-amber-400 text-black font-bold shadow-[1px_1px_0_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-pixel uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-amber-400 text-black font-bold shadow-[1px_1px_0_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {/* Save Post Button */}
          <button
            type="button"
            onClick={handleSavePost}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-pixel text-[10px] uppercase tracking-wider border-2 border-amber-300 border-b-4 border-b-amber-600 border-r-4 border-r-amber-600 shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000] cursor-pointer disabled:opacity-50 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950 font-bold" />
                <span>SAVED!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>PUBLISH POST</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Error or Success Banner */}
      {errorMessage && (
        <div className="bg-red-950/80 border-b-2 border-red-500 text-red-200 px-6 py-2.5 text-xs font-mono flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}
      {saveSuccess && (
        <div className="bg-emerald-950/80 border-b-2 border-emerald-500 text-emerald-200 px-6 py-2.5 text-xs font-mono">
          ✓ Post successfully saved and synchronized with Sanity content lake! Redirecting to admin...
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8">
        {viewMode === 'editor' ? (
          <div className="space-y-8">
            {/* 1. Post Metadata Card */}
            <div className="bg-[#0e1023] border-3 border-[#1e223d] shadow-[6px_6px_0_#000000] p-6">
              <h2 className="font-pixel text-[11px] text-amber-400 uppercase tracking-wider mb-5 pb-3 border-b-2 border-[#1e223d] flex items-center gap-2">
                <span>📋</span>
                <span>ARTICLE METADATA</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-pixel text-slate-300 mb-1.5 uppercase tracking-wide">
                    Post Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DecodeBot V1: Pocketing Aluminum & Odometry Deadwheels"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000] p-3 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-pixel text-slate-300 mb-1.5 uppercase tracking-wide">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">/blog/</span>
                    <input
                      type="text"
                      placeholder="decodebot-v1-pocketing"
                      value={slug}
                      onChange={(e) => {
                        setSlugManuallyEdited(true);
                        setSlug(e.target.value);
                      }}
                      className="flex-1 bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000] p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-pixel text-slate-300 mb-1.5 uppercase tracking-wide">
                    Author / Team
                  </label>
                  <input
                    type="text"
                    placeholder="HSGS RoboLads Team"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000] p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-pixel text-slate-300 mb-1.5 uppercase tracking-wide">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000] p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Excerpt / Summary */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-pixel text-slate-300 mb-1.5 uppercase tracking-wide">
                    Brief Excerpt (Summary for article preview card)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence overview of the article findings, engineering post-mortem, or milestone..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000] p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Interactive Tag Manager */}
                <div className="md:col-span-2">
                  <TagManager
                    tags={tags}
                    onChange={setTags}
                    label="DISPATCH TAGS &amp; TOPICS"
                    placeholder="Type new dispatch tag (e.g. DECODEBOT, WORKSHOP, ODOMETRY) and press Enter..."
                    presetSuggestions={[
                      'SEASON 2026',
                      'DECODEBOT',
                      'HARDWARE',
                      'SOFTWARE',
                      'AUTONOMOUS',
                      'OUTREACH',
                      'WORKSHOP',
                      'SCRIMMAGE',
                      'MATCH RECAP',
                      'TUTORIAL',
                      'DRIVER PRACTICE',
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* 2. Visual Content Block Builder */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-stone-800">
                <div>
                  <h2 className="font-pixel text-[12px] text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🧱</span>
                    <span>RICH POST CONTENT BLOCKS</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Add headers, paragraphs, inline mechanism photos, and important info callouts in any order.
                  </p>
                </div>

                {/* Quick Add Bar Top */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addBlock('h2')}
                    className="px-2.5 py-1.5 bg-[#12152d] hover:bg-[#1e223d] border border-amber-400/60 font-pixel text-[8px] text-amber-300 shadow-[1px_1px_0_#000] flex items-center gap-1 cursor-pointer"
                  >
                    <Heading2 className="w-3 h-3 text-amber-400" />
                    <span>+ HEADER</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('paragraph')}
                    className="px-2.5 py-1.5 bg-[#12152d] hover:bg-[#1e223d] border border-slate-600 font-pixel text-[8px] text-slate-200 shadow-[1px_1px_0_#000] flex items-center gap-1 cursor-pointer"
                  >
                    <AlignLeft className="w-3 h-3" />
                    <span>+ PARAGRAPH</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('image')}
                    className="px-2.5 py-1.5 bg-[#12152d] hover:bg-[#1e223d] border border-cyan-500/60 font-pixel text-[8px] text-cyan-300 shadow-[1px_1px_0_#000] flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-3 h-3 text-cyan-400" />
                    <span>+ IMAGE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('callout')}
                    className="px-2.5 py-1.5 bg-[#12152d] hover:bg-[#1e223d] border border-amber-500/60 font-pixel text-[8px] text-amber-400 shadow-[1px_1px_0_#000] flex items-center gap-1 cursor-pointer"
                  >
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span>+ INFO BOX</span>
                  </button>
                </div>
              </div>

              {/* Block List */}
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="bg-[#0e1023] border-2 border-[#1e223d] hover:border-[#2a3054] shadow-[4px_4px_0_#000000] transition-colors p-4 relative group"
                  >
                    {/* Block Header Strip: Number, Type Badge & Controls */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1a1e38]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500 w-5">
                          #{index + 1}
                        </span>

                        {block.type === 'h2' && (
                          <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-400/60 font-pixel text-[8px] text-amber-300 flex items-center gap-1">
                            <Heading2 className="w-3 h-3" />
                            <span>HEADER (H2)</span>
                          </span>
                        )}

                        {block.type === 'h3' && (
                          <span className="px-2 py-0.5 bg-amber-600/20 border border-amber-600/60 font-pixel text-[8px] text-amber-400 flex items-center gap-1">
                            <Heading3 className="w-3 h-3" />
                            <span>SUBHEADER (H3)</span>
                          </span>
                        )}

                        {block.type === 'paragraph' && (
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-600 font-pixel text-[8px] text-slate-300 flex items-center gap-1">
                            <AlignLeft className="w-3 h-3" />
                            <span>PARAGRAPH</span>
                          </span>
                        )}

                        {block.type === 'image' && (
                          <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/60 font-pixel text-[8px] text-cyan-300 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-cyan-400" />
                            <span>INLINE IMAGE</span>
                          </span>
                        )}

                        {block.type === 'callout' && (
                          <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-400/60 font-pixel text-[8px] text-amber-300 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>INFO CALLOUT BOX</span>
                          </span>
                        )}
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBlock(index, 'up')}
                          disabled={index === 0}
                          title="Move block up"
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(index, 'down')}
                          disabled={index === blocks.length - 1}
                          title="Move block down"
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <div className="h-3 w-px bg-slate-700 mx-1" />
                        <button
                          type="button"
                          onClick={() => deleteBlock(block.id)}
                          title="Delete block"
                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Block Body Inputs */}
                    {/* 1. Header Block (H2 / H3) */}
                    {(block.type === 'h2' || block.type === 'h3') && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={
                            block.type === 'h2'
                              ? 'Enter main section heading...'
                              : 'Enter subsection heading...'
                          }
                          value={block.text || ''}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          className={`w-full bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000] p-3 text-white focus:outline-none focus:border-amber-400 ${
                            block.type === 'h2'
                              ? 'font-heading text-lg text-amber-300 font-bold'
                              : 'font-heading text-base text-amber-400'
                          }`}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateBlock(block.id, {
                                type: block.type === 'h2' ? 'h3' : 'h2',
                              })
                            }
                            className="text-[9px] font-pixel text-slate-400 hover:text-amber-400 underline cursor-pointer"
                          >
                            Switch to {block.type === 'h2' ? 'H3 Subheading' : 'H2 Section Heading'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. Paragraph Block */}
                    {block.type === 'paragraph' && (
                      <div>
                        <textarea
                          rows={4}
                          placeholder="Write your article paragraph here. Explain mechanical tolerances, programming routines, match strategy, or outreach results..."
                          value={block.text || ''}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          className="w-full bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000] p-3 text-slate-200 font-body text-sm leading-relaxed focus:outline-none focus:border-amber-400 resize-y"
                        />
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
                          <span>Standard Paragraph Block</span>
                          <span>{(block.text || '').length} characters</span>
                        </div>
                      </div>
                    )}

                    {/* 3. Image Block */}
                    {block.type === 'image' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left: Upload file or URL input */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[9px] font-pixel text-slate-400 uppercase mb-1">
                                Upload Photo / Diagram
                              </label>
                              <div className="flex items-center gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#12152d] hover:bg-[#1a1e3e] border border-cyan-500/50 text-cyan-300 font-pixel text-[9px] cursor-pointer shadow-[2px_2px_0_#000]">
                                  {uploadingBlockId === block.id ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>UPLOADING TO SANITY...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>CHOOSE IMAGE FILE</span>
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploadingBlockId === block.id}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleImageUpload(block.id, file);
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-pixel text-slate-400 uppercase mb-1">
                                Or Image URL (External / Static)
                              </label>
                              <input
                                type="text"
                                placeholder="https://... or /Photo/cad-robot.png"
                                value={block.imageUrl || ''}
                                onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                                className="w-full bg-[#050610] border-2 border-[#1e223d] p-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          {/* Right: Live Thumbnail Preview */}
                          <div className="border-2 border-[#1e223d] bg-[#050610] p-2 flex flex-col items-center justify-center min-h-[120px] max-h-[160px] overflow-hidden">
                            {block.imageUrl ? (
                              <img
                                src={block.imageUrl}
                                alt={block.alt || 'Preview'}
                                className="max-h-[140px] w-auto object-contain mx-auto border border-stone-800"
                              />
                            ) : (
                              <div className="text-center text-slate-500 text-xs font-mono">
                                <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                                <span>No image selected yet</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Caption and Alt inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
                          <div>
                            <label className="block text-[8px] font-pixel text-slate-400 uppercase mb-1">
                              Caption (Shown directly under image)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. FIG 1: Custom pocketed aluminum 6061-T6 chassis"
                              value={block.caption || ''}
                              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                              className="w-full bg-[#050610] border-2 border-[#1e223d] p-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-pixel text-slate-400 uppercase mb-1">
                              Alt Text (Screen readers / SEO)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. RoboLads robot drivetrain assembly"
                              value={block.alt || ''}
                              onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                              className="w-full bg-[#050610] border-2 border-[#1e223d] p-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Callout / Info Box Block */}
                    {block.type === 'callout' && (
                      <div className="space-y-4">
                        {/* Tone Selector */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-pixel text-[8px] text-slate-400 uppercase mr-1">
                            BOX TONE:
                          </span>
                          {(
                            [
                              { key: 'important', label: '⚡ Important', border: 'border-amber-400 text-amber-300' },
                              { key: 'tip', label: '💡 Engineering Tip', border: 'border-emerald-400 text-emerald-300' },
                              { key: 'warning', label: '⚠️ Warning', border: 'border-red-400 text-red-300' },
                              { key: 'info', label: '📘 Tech Spec', border: 'border-cyan-400 text-cyan-300' },
                            ] as const
                          ).map((tone) => (
                            <button
                              key={tone.key}
                              type="button"
                              onClick={() =>
                                updateBlock(block.id, {
                                  calloutTone: tone.key,
                                  calloutTitle:
                                    block.calloutTitle ||
                                    (tone.key === 'important'
                                      ? 'IMPORTANT NOTICE'
                                      : tone.key === 'tip'
                                      ? 'ENGINEERING TIP'
                                      : tone.key === 'warning'
                                      ? 'CRITICAL WARNING'
                                      : 'TECHNICAL SPECIFICATION'),
                                })
                              }
                              className={`px-2.5 py-1 text-[9px] font-pixel border shadow-[1px_1px_0_#000] cursor-pointer transition-all ${
                                block.calloutTone === tone.key
                                  ? `${tone.border} bg-[#181d3d] font-bold scale-105`
                                  : 'border-stone-700 text-slate-400 hover:text-white bg-[#050610]'
                              }`}
                            >
                              {tone.label}
                            </button>
                          ))}
                        </div>

                        {/* Title & Content */}
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Box Header (e.g. CRITICAL FASTENER TORQUE SPECIFICATION)"
                            value={block.calloutTitle || ''}
                            onChange={(e) =>
                              updateBlock(block.id, { calloutTitle: e.target.value })
                            }
                            className="w-full bg-[#050610] border-2 border-[#1e223d] p-2.5 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                          />

                          <textarea
                            rows={3}
                            placeholder="Write the highlight text, critical rule, key specification, or key engineering observation..."
                            value={block.calloutText || ''}
                            onChange={(e) =>
                              updateBlock(block.id, { calloutText: e.target.value })
                            }
                            className="w-full bg-[#050610] border-2 border-[#1e223d] p-3 text-slate-200 font-body text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Inline Preview of the Box */}
                        <div
                          className={`p-3.5 border-2 shadow-[2px_2px_0_#000] ${
                            block.calloutTone === 'tip'
                              ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200'
                              : block.calloutTone === 'warning'
                              ? 'border-red-500/80 bg-red-950/40 text-red-200'
                              : block.calloutTone === 'info'
                              ? 'border-cyan-500/80 bg-cyan-950/40 text-cyan-200'
                              : 'border-amber-500/80 bg-amber-950/40 text-amber-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-display text-[9px] uppercase tracking-wider mb-1 font-bold">
                            {block.calloutTone === 'tip' ? (
                              <Lightbulb className="w-3.5 h-3.5" />
                            ) : block.calloutTone === 'warning' ? (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            ) : block.calloutTone === 'info' ? (
                              <Info className="w-3.5 h-3.5" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            <span>{block.calloutTitle || 'IMPORTANT NOTICE'}</span>
                          </div>
                          <p className="font-body text-xs leading-relaxed text-slate-200">
                            {block.calloutText || 'Preview text will appear here...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Inline Quick Add Below */}
                    <div className="mt-3 pt-3 border-t border-[#161a33] flex items-center justify-end gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-pixel text-slate-500 uppercase mr-1">
                        + Insert Below:
                      </span>
                      <button
                        type="button"
                        onClick={() => addBlock('paragraph', index)}
                        className="px-2 py-0.5 text-[8px] font-pixel bg-[#050610] border border-slate-700 hover:border-white text-slate-300"
                      >
                        Paragraph
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('h2', index)}
                        className="px-2 py-0.5 text-[8px] font-pixel bg-[#050610] border border-amber-600/70 hover:border-amber-400 text-amber-300"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('image', index)}
                        className="px-2 py-0.5 text-[8px] font-pixel bg-[#050610] border border-cyan-600/70 hover:border-cyan-400 text-cyan-300"
                      >
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('callout', index)}
                        className="px-2 py-0.5 text-[8px] font-pixel bg-[#050610] border border-amber-500/70 hover:border-amber-400 text-amber-400"
                      >
                        Info Box
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Big Add Block Section */}
              <div className="mt-6 p-6 border-2 border-dashed border-stone-700 bg-[#0a0c1e] text-center">
                <p className="font-pixel text-[10px] text-slate-400 uppercase tracking-wider mb-4">
                  ADD NEXT SECTION TO YOUR POST:
                </p>
                <div className="flex flex-wrap justify-center items-center gap-3">
                  <button
                    type="button"
                    onClick={() => addBlock('h2')}
                    className="px-4 py-2.5 bg-[#12152d] hover:bg-[#1a1e3e] border-2 border-amber-400 font-pixel text-[9px] text-amber-300 shadow-[2px_2px_0_#000] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Heading2 className="w-4 h-4 text-amber-400" />
                    <span>SECTION HEADER (H2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock('paragraph')}
                    className="px-4 py-2.5 bg-[#12152d] hover:bg-[#1a1e3e] border-2 border-slate-500 font-pixel text-[9px] text-white shadow-[2px_2px_0_#000] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-300" />
                    <span>PARAGRAPH</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock('image')}
                    className="px-4 py-2.5 bg-[#12152d] hover:bg-[#1a1e3e] border-2 border-cyan-400 font-pixel text-[9px] text-cyan-300 shadow-[2px_2px_0_#000] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>INLINE IMAGE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock('callout')}
                    className="px-4 py-2.5 bg-[#12152d] hover:bg-[#1a1e3e] border-2 border-amber-500 font-pixel text-[9px] text-amber-400 shadow-[2px_2px_0_#000] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>INFO / CALLOUT BOX</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             LIVE PREVIEW MODE: Exact public styling with parchment texture
             ========================================================================= */
          <div className="bg-amber-50 text-slate-900 p-6 sm:p-10 border-4 border-black shadow-[8px_8px_0_#000000]">
            <div className="pb-6 border-b-2 border-stone-300 mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2.5 py-1 bg-amber-400 text-black font-display text-[9px] uppercase tracking-wider shadow-[2px_2px_0_#000000]">
                  DISPATCH ENTRY
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-slate-800 font-display text-[8px] uppercase tracking-wider border border-stone-300">
                  {category}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-heading text-slate-900 tracking-tight leading-tight mb-4">
                {title.trim() ? title : 'Untitled Dispatch'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-display text-slate-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-slate-600 font-body text-xs">
                  By <strong className="font-semibold text-slate-900">{author}</strong>
                </span>
              </div>

              {excerpt.trim() && (
                <p className="mt-4 text-sm font-body text-slate-800 italic border-l-2 border-stone-300 pl-3 leading-relaxed">
                  {excerpt}
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-amber-100 text-slate-800 font-display text-[8px] uppercase tracking-wider border border-stone-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preview of all Blocks */}
            <div className="space-y-6">
              {blocks.map((block) => {
                if (block.type === 'h2') {
                  return (
                    <h2
                      key={block.id}
                      className="font-heading text-xl sm:text-2xl text-slate-900 mt-8 mb-4 pb-2 border-b-2 border-stone-300 tracking-wide"
                    >
                      {block.text || 'Section Heading'}
                    </h2>
                  );
                }

                if (block.type === 'h3') {
                  return (
                    <h3
                      key={block.id}
                      className="font-heading text-lg sm:text-xl text-slate-800 mt-6 mb-3 tracking-wide"
                    >
                      {block.text || 'Subsection Heading'}
                    </h3>
                  );
                }

                if (block.type === 'image') {
                  return (
                    <figure key={block.id} className="my-6">
                      <div className="border-3 border-stone-300 bg-[#08081a] shadow-[4px_4px_0_#000000] overflow-hidden p-1">
                        {block.imageUrl ? (
                          <img
                            src={block.imageUrl}
                            alt={block.alt || block.caption || 'Article image'}
                            className="w-full h-auto max-h-[520px] object-contain mx-auto"
                          />
                        ) : (
                          <div className="p-8 text-center text-slate-500 font-mono text-xs">
                            [No image source set]
                          </div>
                        )}
                      </div>
                      {(block.caption || block.alt) && (
                        <figcaption className="text-center font-display text-[9px] text-slate-600 mt-2 tracking-wider">
                          {block.caption || block.alt}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                if (block.type === 'callout') {
                  const tone = block.calloutTone || 'important';
                  const config = {
                    important: {
                      border: 'border-amber-600',
                      bg: 'bg-[#fef3c7]/90',
                      badge: 'bg-amber-400 text-black',
                      icon: <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />,
                    },
                    tip: {
                      border: 'border-emerald-600',
                      bg: 'bg-[#ecfdf5]/90',
                      badge: 'bg-emerald-500 text-white',
                      icon: <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0" />,
                    },
                    warning: {
                      border: 'border-red-600',
                      bg: 'bg-[#fef2f2]/90',
                      badge: 'bg-red-500 text-white',
                      icon: <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />,
                    },
                    info: {
                      border: 'border-cyan-600',
                      bg: 'bg-[#ecfeff]/90',
                      badge: 'bg-cyan-500 text-white',
                      icon: <Info className="w-4 h-4 text-cyan-700 shrink-0" />,
                    },
                  }[tone];

                  return (
                    <div
                      key={block.id}
                      className={`my-6 border-2 ${config.border} ${config.bg} p-4 sm:p-5 shadow-[3px_3px_0_#000000]`}
                    >
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-400/40">
                        {config.icon}
                        <span
                          className={`font-display text-[9px] uppercase tracking-wider px-2 py-0.5 ${config.badge} shadow-[1px_1px_0_#000]`}
                        >
                          {block.calloutTitle || 'IMPORTANT NOTICE'}
                        </span>
                      </div>
                      <p className="font-body text-sm text-slate-900 leading-relaxed whitespace-pre-line">
                        {block.calloutText || 'Info box text will appear here.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <p
                    key={block.id}
                    className="font-body text-base text-slate-700 leading-relaxed mb-5"
                  >
                    {block.text || 'Write your paragraph text here...'}
                  </p>
                );
              })}
            </div>

            <div className="mt-12 pt-6 border-t-2 border-stone-300 flex items-center justify-between text-xs text-slate-600 font-body">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Published by {author}
              </span>
              <span className="font-display text-[8px] text-slate-600">FTC #31113</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
