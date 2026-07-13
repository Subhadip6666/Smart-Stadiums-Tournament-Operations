import React from 'react';
import { cn } from '../../utils/cn';
import type { RouteResult } from '../../types';
import { Navigation, Accessibility } from 'lucide-react';

interface RouteMapProps {
  route: RouteResult;
  className?: string;
}

/**
 * SVG visualization of a route through the stadium.
 * Shows waypoints connected by an animated dashed path.
 */
export const RouteMap: React.FC<RouteMapProps> = ({ route, className }) => {
  const segments = route.segments;
  if (segments.length === 0) return null;

  // Generate evenly-spaced points along a curved path
  const points = segments.map((_, i) => {
    const t = i / (segments.length - 1);
    const x = 80 + t * 640;
    const y = 200 + Math.sin(t * Math.PI) * -80 + (i % 2 === 0 ? -20 : 20);
    return { x, y };
  });

  // Build SVG path
  const pathD = points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${d} Q ${cpx} ${prev.y} ${p.x} ${p.y}`;
  }, '');

  return (
    <div className={cn('glass-card overflow-hidden', className)}>
      <svg viewBox="0 0 800 350" className="w-full" style={{ minHeight: 200 }}>
        {/* Background grid */}
        <defs>
          <pattern id="routeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="350" fill="url(#routeGrid)" />

        {/* Animated route path */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8 4" opacity="0.7">
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />
        </path>
        <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.3" />

        {/* Waypoints */}
        {points.map((p, i) => {
          const isStart = i === 0;
          const isEnd = i === points.length - 1;
          const seg = segments[i];
          return (
            <g key={seg.id}>
              {/* Node */}
              <circle cx={p.x} cy={p.y} r={isStart || isEnd ? 12 : 7}
                fill={isStart ? '#22c55e' : isEnd ? '#ef4444' : '#1e293b'}
                stroke={isStart ? '#4ade80' : isEnd ? '#f87171' : '#3b82f6'}
                strokeWidth="2"
              />
              {(isStart || isEnd) && (
                <text x={p.x} y={p.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">
                  {isStart ? 'A' : 'B'}
                </text>
              )}
              {/* Label */}
              <text x={p.x} y={p.y + (i % 2 === 0 ? -20 : 28)} textAnchor="middle"
                fill="#e2e8f0" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
                {seg.name.length > 18 ? seg.name.slice(0, 16) + '…' : seg.name}
              </text>
              <text x={p.x} y={p.y + (i % 2 === 0 ? -8 : 40)} textAnchor="middle"
                fill="#64748b" fontSize="9" fontFamily="'JetBrains Mono', monospace" style={{ textTransform: 'uppercase' }}>
                {seg.type}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Walk time */}
      <div className="flex items-center justify-center gap-2 p-3 border-t border-slate-800/60">
        <Navigation className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-semibold text-slate-200">
          Estimated walk time:
          <span className="font-mono-data text-blue-400 ml-2">
            {Math.floor(route.total_walk_time_s / 60)}m {route.total_walk_time_s % 60}s
          </span>
        </span>
        {route.mode === 'accessible' && (
          <span className="ml-2 flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            <Accessibility className="h-3 w-3" /> Accessible
          </span>
        )}
      </div>
    </div>
  );
};