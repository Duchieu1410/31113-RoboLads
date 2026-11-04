import type { CSSProperties } from 'react';
import { iconRects, type PixelIconName } from './pixel-icons';

interface PixelIconProps {
  name: PixelIconName;
  /** Rendered size in px. 16x16 art scales cleanly at multiples of 16. */
  size?: 16 | 32 | 48 | 64;
  /** Provide for informative icons. Omit for decorative ones (hidden from screen readers). */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function PixelIcon({ name, size = 32, label, className = '', style }: PixelIconProps) {
  return (
    <svg
      className={`px-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={style}
    >
      {iconRects(name).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.color} />
      ))}
    </svg>
  );
}
