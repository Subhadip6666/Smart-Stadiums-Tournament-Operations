import React from 'react';
import type { Zone } from '../../types';
import { DENSITY_COLORS } from '../../types';

interface HeatmapOverlayProps {
  zones: Zone[];
}

/**
 * SVG radial gradient overlay that renders colored glow circles
 * behind each zone marker on the stadium map.
 */
export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ zones }) => {
  return (
    <g className="heatmap-overlay">
      <defs>
        {zones.map((zone) => {
          const colors = DENSITY_COLORS[zone.density_bucket];
          return (
            <radialGradient key={`grad-${zone.zone_id}`} id={`heatGrad-${zone.zone_id}`}>
              <stop offset="0%" stopColor={colors.fill} stopOpacity="0.35" />
              <stop offset="50%" stopColor={colors.fill} stopOpacity="0.12" />
              <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
            </radialGradient>
          );
        })}
      </defs>
      {zones.map((zone) => {
        const radius = zone.density_bucket === 'critical' ? 80 : zone.density_bucket === 'high' ? 60 : zone.density_bucket === 'moderate' ? 45 : 30;
        return (
          <circle
            key={`heat-${zone.zone_id}`}
            cx={zone.x}
            cy={zone.y}
            r={radius}
            fill={`url(#heatGrad-${zone.zone_id})`}
            className="transition-all duration-1000 ease-in-out"
          />
        );
      })}
    </g>
  );
};