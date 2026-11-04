import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface SlotProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon or any content. */
  children?: ReactNode;
  /** Stack count shown bottom-right in the pixel font. */
  count?: number | string;
  selected?: boolean;
  /** Render a real <button>. Defaults to true when onClick is given. */
  interactive?: boolean;
  /** Accessible name. Required for icon-only slots. */
  label?: string;
  forceState?: 'hover' | 'active' | 'focus';
}

/** 64x64 inventory slot: stats, subsystem tabs, resource categories, hotbar. */
export function Slot({
  children,
  count,
  selected,
  interactive,
  label,
  forceState,
  className = '',
  onClick,
  disabled,
  ...rest
}: SlotProps) {
  // WCAG 2.5.3: the accessible name must contain the visible stack count text
  const name = label !== undefined && count !== undefined ? `${label} ${count}` : label;
  const cls = ['px-slot', selected ? 'px-slot--selected' : '', className].filter(Boolean).join(' ');
  const inner = (
    <>
      {children}
      {count !== undefined && (
        <span className="px-slot__count" aria-hidden="true">
          {count}
        </span>
      )}
    </>
  );
  if (interactive ?? Boolean(onClick)) {
    return (
      <button
        type="button"
        className={cls}
        aria-label={name}
        aria-pressed={selected}
        aria-disabled={disabled || undefined}
        data-force={forceState}
        onClick={disabled ? undefined : onClick}
        {...rest}
      >
        {inner}
      </button>
    );
  }
  return (
    <span className={cls} role={name ? 'img' : undefined} aria-label={name} data-force={forceState}>
      {inner}
    </span>
  );
}
