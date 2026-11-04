interface PixelDividerProps {
  /**
   * `rail`: Sleek dark metal/stone rail with amber telemetry track (default).
   * `tech`: Industrial robotics hazard/circuit seam.
   * `strata`: Dark stone to deepslate rock seam.
   * `grass`: Alias for rail (backward compat, no literal Minecraft grass).
   */
  variant?: 'rail' | 'tech' | 'strata' | 'grass';
  className?: string;
}

/**
 * Geometric pixel seam between sections.
 * Inspired by retro game interfaces & robotics engineering — zero literal Minecraft grass blocks.
 */
export function PixelDivider({ variant = 'rail', className = '' }: PixelDividerProps) {
  const activeVariant = variant === 'grass' ? 'rail' : variant;

  if (activeVariant === 'strata') {
    return (
      <div className={`px-divider px-divider--strata ${className}`.trim()} aria-hidden="true">
        <span className="px-divider__stone" />
        <span className="px-divider__deepslate" />
        <span className="px-divider__bedrock" />
      </div>
    );
  }

  return (
    <div
      className={`px-divider px-divider--${activeVariant} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
