import React from 'react';
import { cn } from '../../utils/cn';
import type { RouteResult } from '../../types';
import { ArrowRight } from 'lucide-react';

interface WayfindingPanelProps {
  route: RouteResult;
  className?: string;
}

export const WayfindingPanel: React.FC<WayfindingPanelProps> = ({ route, className }) => {
  const segs = route.segments;
  const avgPerSeg = segs.length > 1 ? Math.round(route.total_walk_time_s / (segs.length - 1)) : 0;

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Step-by-step Directions</h4>
      <div className="space-y-2">
        {segs.map((seg, i) => (
          <div key={seg.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-800/40 animate-slide-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              i === 0 ? 'bg-emerald-600 text-white' : i === segs.length - 1 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'
            )}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{seg.name}</p>
              <p className="text-xs text-slate-500 capitalize">{seg.type}</p>
            </div>
            {i < segs.length - 1 && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span className="font-mono-data">{avgPerSeg}s</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};