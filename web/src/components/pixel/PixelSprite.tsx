'use client';

import React, { useEffect, useState } from 'react';
import {
  CERBERUS_FRAME_1,
  CERBERUS_FRAME_2,
  MINI_ROBOT_SPRITE,
  spriteToDataUri,
} from './pixel-sprites';

export type PixelSpriteName = 'cerberus' | 'mini-robot';

interface PixelSpriteProps {
  name: PixelSpriteName;
  size?: number;
  animated?: boolean;
  className?: string;
  alt?: string;
}

const CERBERUS_URI_1 = spriteToDataUri(CERBERUS_FRAME_1);
const CERBERUS_URI_2 = spriteToDataUri(CERBERUS_FRAME_2);
const MINI_ROBOT_URI = spriteToDataUri(MINI_ROBOT_SPRITE);

export function PixelSprite({
  name,
  size = 32,
  animated = false,
  className = '',
  alt = '',
}: PixelSpriteProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!animated || name !== 'cerberus') return;

    // Check prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const interval = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 180);

    return () => clearInterval(interval);
  }, [animated, name]);

  let src = MINI_ROBOT_URI;
  if (name === 'cerberus') {
    src = frame === 0 ? CERBERUS_URI_1 : CERBERUS_URI_2;
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      style={{
        imageRendering: 'pixelated',
        width: `${size}px`,
        height: `${size}px`,
      }}
      className={`inline-block select-none ${className}`}
      draggable={false}
    />
  );
}
