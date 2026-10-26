'use client';

import React, { useState, useMemo } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  fallbackIcon?: React.ReactNode;
}

export function ImageWithFallback({
  src,
  alt = 'Image',
  className = '',
  fallbackTitle,
  fallbackSubtitle,
  fallbackIcon,
  ...props
}: ImageWithFallbackProps) {
  const [attempt, setAttempt] = useState<number>(0);
  const [failed, setFailed] = useState(false);

  // Derive source candidates: tries original, then alternative common extensions, then .svg
  const candidates = useMemo(() => {
    if (!src || typeof src !== 'string') return [];
    const list: string[] = [src];
    const match = src.match(/^(.*)\.(jpg|jpeg|png|webp|svg)$/i);
    if (match) {
      const base = match[1];
      const exts = ['jpg', 'png', 'webp', 'jpeg', 'svg'];
      for (const ext of exts) {
        const candidate = `${base}.${ext}`;
        if (!list.includes(candidate)) {
          list.push(candidate);
        }
      }
    }
    return list;
  }, [src]);

  const currentSrc = candidates[attempt] || undefined;

  const handleError = () => {
    if (attempt + 1 < candidates.length) {
      setAttempt((prev) => prev + 1);
    } else {
      setFailed(true);
    }
  };

  if (failed || !currentSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950/80 p-6 text-center border border-white/10 ${className}`}
        style={{ minHeight: '180px' }}
      >
        {fallbackIcon ? (
          <div className="mb-2 text-amber-400">{fallbackIcon}</div>
        ) : (
          <div className="mb-2 w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
            RBL
          </div>
        )}
        <span className="font-bold text-white text-sm tracking-wide">
          {fallbackTitle || alt || 'FTC 31113 RoboLads'}
        </span>
        {fallbackSubtitle && (
          <span className="text-xs text-slate-400 mt-1 font-mono">
            {fallbackSubtitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
