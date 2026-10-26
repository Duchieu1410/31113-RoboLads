'use client';

import React, { useState } from 'react';

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
  const [error, setError] = useState(false);

  if (error || !src) {
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
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
