import React from 'react';
import { cn } from '../../utils/cn';
import type { DensityBucket } from '../../types';
import { DENSITY_COLORS } from '../../types';

interface DensityBadgeProps {
  density: DensityBucket;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const DensityBadge: React.FC<DensityBadgeProps> = ({
  density,
  size = 'sm',
  showDot = true,
  className,
}) => {
  const colors = DENSITY_COLORS[density];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider',
        colors.bg,
        colors.text,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
            density === 'critical' && 'animate-pulse'
          )}
          style={{ backgroundColor: colors.fill }}
        />
      )}
      {density}
    </span>
  );
};