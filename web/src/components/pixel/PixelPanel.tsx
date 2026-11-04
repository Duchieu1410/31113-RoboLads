import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type PanelVariant = 'stone' | 'dirt' | 'parchment' | 'night' | 'bedrock';

interface PixelPanelProps extends HTMLAttributes<HTMLElement> {
  variant?: PanelVariant;
  /** Corner rivets, used on the 3D viewer frame. */
  rivets?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

/** Replaces every navy card. Bevelled, square, outlined. No border-radius. */
export function PixelPanel({
  variant = 'stone',
  rivets = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: PixelPanelProps) {
  const cls = [
    'px-panel',
    variant !== 'stone' ? `px-panel--${variant}` : '',
    rivets ? 'px-panel--rivets' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
