'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { playBlip } from '@/lib/pixel-sound';

export type ButtonVariant = 'primary' | 'stone' | 'danger';
export type ForcedState = 'hover' | 'active' | 'focus';

interface BaseProps {
  variant?: ButtonVariant;
  /** Pair two buttons side by side (title-screen layout). */
  half?: boolean;
  disabled?: boolean;
  /** Only for the /dev/pixel showcase: pins a visual state. */
  forceState?: ForcedState;
  className?: string;
  children?: ReactNode;
}

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: undefined };
type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'href'> & { href: string };

/** Button or link in the pixel style. Plays a blip on click only if sound is on (default off). */
export function PixelButton(props: ButtonProps | LinkProps) {
  const { variant = 'stone', half, disabled, forceState, className = '', children, ...rest } = props;
  const cls = [
    'px-btn',
    variant !== 'stone' ? `px-btn--${variant}` : '',
    half ? 'px-btn--half' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (rest.href !== undefined) {
    const { href, onClick, ...anchorRest } = rest as Omit<LinkProps, keyof BaseProps>;
    const handle = (e: MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      playBlip('click');
      onClick?.(e);
    };
    return (
      <Link
        {...anchorRest}
        href={href}
        className={cls}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        data-force={forceState}
        onClick={handle}
      >
        {children}
      </Link>
    );
  }

  const { onClick, type, ...buttonRest } = rest as Omit<ButtonProps, keyof BaseProps>;
  return (
    <button
      {...buttonRest}
      type={type ?? 'button'}
      className={cls}
      disabled={disabled}
      data-force={forceState}
      onClick={(e) => {
        playBlip('click');
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
