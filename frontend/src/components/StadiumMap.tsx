import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Zone, DensityBucket } from '../types';
import { DENSITY_COLORS } from '../types';
import { HeatmapOverlay } from './crowd/HeatmapOverlay';

interface StadiumMapProps {
  zones: Zone[];
  onZoneClick?: (zone: Zone) => void;
  className?: string;
}

const DENSITY_RADIUS: Record<DensityBucket, number> = {
  low: 10, moderate: 16, high: 24, critical: 34,
};

function checkCollision(b1: any, b2: any, pad = 8) {
  return b1.x - pad < b2.x + b2.w + pad && b1.x + b1.w + pad > b2.x - pad &&
    b1.y - pad < b2.y + b2.h + pad && b1.y + b1.h + pad > b2.y - pad;
}

export const StadiumMap: React.FC<StadiumMapProps> = ({ zones, onZoneClick, className }) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Compute label positions with collision avoidance
  const labels = useMemo(() => {
    const result: { zone: Zone; lx: number; ly: number }[] = [];
    const LW = 130, LH = 40;
    const sorted = [...zones].sort((a, b) => {
      const o: Record<string, number> = { critical: 4, high: 3, moderate: 2, low: 1 };
      return (o[b.density_bucket] || 0) - (o[a.density_bucket] || 0);
    });

    sorted.forEach((zone) => {
      let best: { x: number; y: number } | null = null;
      const sa = Math.atan2(zone.y - 300, zone.x - 400);
      for (let r = 50; r <= 220 && !best; r += 15) {
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          const cx = zone.x + Math.cos(sa + a) * r - LW / 2;
          const cy = zone.y + Math.sin(sa + a) * r - LH / 2;
          if (cx < 5 || cx + LW > 795 || cy < 5 || cy + LH > 595) continue;
          const box = { x: cx, y: cy, w: LW, h: LH };
          if (!result.some((e) => checkCollision(box, { x: e.lx, y: e.ly, w: LW, h: LH }))) {
            best = { x: cx, y: cy };
            break;
          }
        }
      }
      if (!best) best = { x: zone.x + 40, y: zone.y - 30 };
      result.push({ zone, lx: best.x, ly: best.y });
    });
    return result;
  }, [zones]);

  return (
    <div className={`w-full h-full min-h-[500px] bg-slate-950 rounded-xl overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col ${className || ''}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-slate-950/90 to-transparent">
        <h2 className="text-lg font-bold text-white">Live Crowd Map</h2>
        <div className="flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
          <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-xs font-medium text-slate-200 font-mono-data">{tick}s ago</span>
        </div>
      </div>

      <svg viewBox="0 0 800 600" className="w-full h-full flex-1" style={{ backgroundColor: '#020617' }}>
        {/* Stadium structure */}
        <g>
          <rect x="50" y="50" width="700" height="500" rx="200" className="fill-slate-800/30 stroke-slate-700/60" strokeWidth="2" />
          <rect x="100" y="90" width="600" height="420" rx="160" className="fill-slate-800/50 stroke-slate-600/40" strokeWidth="1.5" />
          <line x1="100" y1="300" x2="700" y2="300" className="stroke-slate-700/30" strokeWidth="1" strokeDasharray="10 10" />
          <line x1="400" y1="90" x2="400" y2="510" className="stroke-slate-700/30" strokeWidth="1" strokeDasharray="10 10" />
          <rect x="180" y="150" width="440" height="300" rx="100" className="fill-slate-700/30 stroke-slate-500/30" strokeWidth="1" />
          <rect x="250" y="200" width="300" height="200" rx="20" className="fill-emerald-900/20 stroke-emerald-700/30" strokeWidth="2" />
          <circle cx="400" cy="300" r="40" className="fill-transparent stroke-emerald-700/25" strokeWidth="2" />
          <line x1="400" y1="200" x2="400" y2="400" className="stroke-emerald-700/25" strokeWidth="2" />
          <rect x="250" y="240" width="40" height="120" className="fill-transparent stroke-emerald-700/25" strokeWidth="2" />
          <rect x="510" y="240" width="40" height="120" className="fill-transparent stroke-emerald-700/25" strokeWidth="2" />
        </g>

        {/* Heatmap glow */}
        <HeatmapOverlay zones={zones} />

        {/* Zone markers */}
        {zones.map((zone) => {
          const colors = DENSITY_COLORS[zone.density_bucket];
          const r = DENSITY_RADIUS[zone.density_bucket];
          const isHovered = hoveredZone === zone.zone_id;
          return (
            <g key={zone.zone_id}>
              {zone.density_bucket === 'critical' && (
                <circle cx={zone.x} cy={zone.y} r={r + 6} fill={colors.fill} opacity="0.2">
                  <animate attributeName="r" values={`${r + 4};${r + 12};${r + 4}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.08;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={zone.x} cy={zone.y} r={isHovered ? r + 3 : r}
                fill={colors.fill} stroke={colors.stroke} strokeWidth="3"
                style={{ cursor: 'pointer', transition: 'r 0.2s ease, opacity 0.2s ease' }}
                opacity={isHovered ? 1 : 0.85}
                onClick={() => onZoneClick?.(zone)}
                onMouseEnter={() => setHoveredZone(zone.zone_id)}
                onMouseLeave={() => setHoveredZone(null)}
                tabIndex={0} role="button"
                aria-label={`${zone.name}, density level: ${zone.density_bucket}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onZoneClick?.(zone); } }}
              />
            </g>
          );
        })}

        {/* Labels with leader lines */}
        {labels.map(({ zone, lx, ly }) => {
          const colors = DENSITY_COLORS[zone.density_bucket];
          const cx = lx + 65, cy = ly + 20;
          return (
            <g key={`lbl-${zone.zone_id}`} className="pointer-events-none">
              <line x1={zone.x} y1={zone.y} x2={cx} y2={cy} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              <rect x={lx} y={ly} width="130" height="40" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
              <rect x={lx} y={ly} width="6" height="40" rx="3" fill={colors.fill} />
              <text x={lx + 14} y={ly + 17} fill="#f1f5f9" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">
                {zone.name.length > 16 ? zone.name.slice(0, 14) + '…' : zone.name}
              </text>
              <text x={lx + 14} y={ly + 32} fill={colors.stroke} fontSize="10" fontWeight="600" fontFamily="'JetBrains Mono', monospace" style={{ textTransform: 'uppercase' }}>
                {zone.density_bucket}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700/50 shadow-xl z-10">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Crowd Density</h4>
        <div className="flex flex-col gap-1.5">
          {(['critical', 'high', 'moderate', 'low'] as DensityBucket[]).map((d) => (
            <div key={d} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DENSITY_COLORS[d].fill }} />
              <span className="text-[11px] font-medium text-slate-300 capitalize">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
