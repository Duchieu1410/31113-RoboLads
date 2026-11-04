'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Tag as TagIcon, Plus, X, Pencil, Check, Sparkles } from 'lucide-react';

export interface TagManagerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  presetSuggestions?: string[];
  label?: string;
  placeholder?: string;
}

export function TagManager({
  tags,
  onChange,
  presetSuggestions = [],
  label = 'SEARCH & DISCIPLINE TAGS',
  placeholder = 'Add new tag (e.g. ODOMETRY)...',
}: TagManagerProps) {
  const [newTagInput, setNewTagInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  const cleanTag = (str: string) => {
    return str
      .replace(/^#+/, '')
      .trim()
      .toUpperCase();
  };

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd !== undefined ? tagToAdd : newTagInput;
    const cleaned = cleanTag(raw);
    if (!cleaned) return;

    // Check duplicate (case-insensitive)
    if (tags.some((t) => t.toUpperCase() === cleaned)) {
      setNewTagInput('');
      return;
    }

    onChange([...tags, cleaned]);
    setNewTagInput('');
  };

  const handleKeyDownNew = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
    if (editingIndex === indexToRemove) {
      setEditingIndex(null);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(tags[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const cleaned = cleanTag(editValue);
    if (!cleaned) {
      handleRemoveTag(editingIndex);
      setEditingIndex(null);
      return;
    }

    const updated = [...tags];
    updated[editingIndex] = cleaned;
    onChange(updated);
    setEditingIndex(null);
  };

  const handleKeyDownEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const availablePresets = presetSuggestions.filter(
    (preset) => !tags.some((t) => t.toUpperCase() === preset.toUpperCase())
  );

  return (
    <div className="space-y-3 font-mono">
      {/* Label and Count */}
      <div className="flex items-center justify-between text-[11px] font-pixel text-slate-300 uppercase">
        <label className="flex items-center gap-1.5 text-amber-400">
          <TagIcon className="w-3.5 h-3.5" />
          {label}
        </label>
        <span className="text-[9px] text-slate-500 font-normal">
          {tags.length} {tags.length === 1 ? 'TAG' : 'TAGS'} ATTACHED
        </span>
      </div>

      {/* Current Tags Chips List */}
      <div className="min-h-[44px] p-2.5 bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000] flex flex-wrap items-center gap-2">
        {tags.length === 0 ? (
          <span className="text-xs text-slate-500 italic font-mono px-1">
            No tags assigned yet. Add keywords below for search indexing and categorization.
          </span>
        ) : (
          tags.map((tag, idx) => {
            const isEditing = editingIndex === idx;

            if (isEditing) {
              return (
                <div
                  key={`edit-${idx}`}
                  className="inline-flex items-center gap-1 bg-[#121633] border-2 border-cyan-400 px-2 py-0.5 shadow-[2px_2px_0_#000000]"
                >
                  <span className="text-cyan-400 text-xs font-bold font-pixel">#</span>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDownEdit}
                    onBlur={handleSaveEdit}
                    className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none w-24 sm:w-32 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    title="Save tag"
                    className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    title="Cancel edit"
                    className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={`${tag}-${idx}`}
                className="group inline-flex items-center gap-1.5 bg-[#0e1023] hover:bg-[#181d3d] border border-[#2d3561] hover:border-amber-400/80 px-2.5 py-1 text-xs text-slate-200 transition-all shadow-[2px_2px_0_#000000]"
              >
                <span className="font-pixel text-[10px] text-amber-400 font-bold">#{tag}</span>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleStartEdit(idx)}
                  title="Rename / edit tag"
                  className="text-slate-500 hover:text-amber-300 opacity-60 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                </button>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  title="Remove tag"
                  className="text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Input to Add New Tag */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleKeyDownNew}
            placeholder={placeholder}
            className="w-full bg-[#050610] border-2 border-[#1e223d] focus:border-amber-400 px-3.5 py-2 text-xs text-white font-mono shadow-[inset_2px_2px_0_#000000] focus:outline-none uppercase"
          />
        </div>

        <button
          type="button"
          onClick={() => handleAddTag()}
          disabled={!newTagInput.trim()}
          className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-pixel text-xs font-bold border-2 border-amber-300 shadow-[2px_2px_0_#000000] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          ADD TAG
        </button>
      </div>

      {/* Suggested Quick Presets */}
      {availablePresets.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-[10px] font-pixel text-slate-400 uppercase mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>QUICK PRESETS (CLICK TO ATTACH):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availablePresets.slice(0, 10).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddTag(preset)}
                className="px-2 py-0.5 bg-[#08081a] hover:bg-[#141833] border border-[#1e223d] hover:border-cyan-400 text-slate-400 hover:text-cyan-300 text-[10px] font-pixel transition-colors cursor-pointer shadow-[1px_1px_0_#000000]"
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
