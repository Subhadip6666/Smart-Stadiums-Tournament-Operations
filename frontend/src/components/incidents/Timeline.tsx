import React from 'react';
import { cn } from '../../utils/cn';
import type { Incident, IncidentSeverity } from '../../types';

interface TimelineProps {
  incidents: Incident[];
  maxItems?: number;
  className?: string;
}

const DOT_COLORS: Record<IncidentSeverity, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  moderate: 'bg-amber-500',
  low: 'bg-slate-500',
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export const Timeline: React.FC<TimelineProps> = ({ incidents, maxItems = 8, className }) => {
  const items = incidents.slice(0, maxItems);

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-slate-700 via-slate-800 to-transparent" />

      <div className="space-y-4">
        {items.map((inc, i) => (
          <div
            key={inc.id}
            className="relative flex items-start gap-3 pl-6 animate-slide-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Dot */}
            <div className="absolute left-0 top-1.5">
              <div className={cn('h-3.5 w-3.5 rounded-full border-2 border-slate-950', DOT_COLORS[inc.severity])}>
                {inc.severity === 'critical' && (
                  <div className={cn('absolute inset-0 rounded-full animate-ping opacity-40', DOT_COLORS[inc.severity])} />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono-data text-slate-500">{formatTime(inc.created_at)}</span>
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                  inc.severity === 'critical' ? 'text-red-400 bg-red-500/10' :
                  inc.severity === 'high' ? 'text-orange-400 bg-orange-500/10' :
                  'text-slate-400 bg-slate-800'
                )}>
                  {inc.type}
                </span>
              </div>
              <p className="text-sm text-slate-200 truncate">{inc.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};