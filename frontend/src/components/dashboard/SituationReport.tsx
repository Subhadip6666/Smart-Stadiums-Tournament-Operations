import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface SituationReportProps {
  className?: string;
  overallStatus: 'operational' | 'degraded' | 'critical';
  totalOccupancy: number;
  activeIncidents: number;
}

const STATUS_CONFIG = {
  operational: { label: 'OPERATIONAL', color: 'text-emerald-400', dot: 'status-dot-green' },
  degraded: { label: 'DEGRADED', color: 'text-amber-400', dot: 'status-dot-amber' },
  critical: { label: 'CRITICAL', color: 'text-red-400', dot: 'status-dot-red' },
};

export const SituationReport: React.FC<SituationReportProps> = ({
  className, overallStatus, totalOccupancy,
}) => {
  const [elapsed, setElapsed] = useState(67);
  const status = STATUS_CONFIG[overallStatus];

  useEffect(() => {
    const timer = setInterval(() => setElapsed((p) => Math.min(p + 1, 90)), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn('flex items-center gap-4 flex-wrap', className)}>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-slate-100">Brazil</span>
        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">
          <span className="text-xl font-bold font-mono-data text-white">1</span>
          <span className="text-slate-500 mx-1">—</span>
          <span className="text-xl font-bold font-mono-data text-white">1</span>
        </div>
        <span className="text-lg font-bold text-slate-100">Germany</span>
        <div className="h-6 w-px bg-slate-700" />
        <span className="px-2 py-0.5 rounded bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-bold font-mono-data animate-pulse">LIVE</span>
        <span className="text-sm font-mono-data text-slate-300">{elapsed}'</span>
        <span className="text-xs text-slate-500 uppercase font-semibold">2ND HALF</span>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase font-medium">Occupancy</span>
          <span className="font-mono-data font-bold text-sm text-slate-200">{totalOccupancy}%</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase font-medium">Stadium</span>
          <div className="flex items-center gap-1.5">
            <div className={status.dot} />
            <span className={cn('text-xs font-bold font-mono-data uppercase', status.color)}>{status.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};