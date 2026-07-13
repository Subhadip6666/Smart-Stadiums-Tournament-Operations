import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, Heart, Users, Wrench, Shield } from 'lucide-react';
import type { Incident, IncidentType, IncidentSeverity } from '../../types';

interface IncidentCardProps {
  incident: Incident;
  compact?: boolean;
  onClick?: (incident: Incident) => void;
  className?: string;
}

const TYPE_ICONS: Record<IncidentType, React.ReactNode> = {
  MEDICAL: <Heart className="h-4 w-4" />,
  CROWD: <Users className="h-4 w-4" />,
  SECURITY: <Shield className="h-4 w-4" />,
  FACILITY: <Wrench className="h-4 w-4" />,
};

const SEVERITY_STYLES: Record<IncidentSeverity, { card: string; badge: string; title: string }> = {
  critical: {
    card: 'border-l-red-500 bg-red-950/15 border-red-900/30',
    badge: 'bg-red-500/15 text-red-400',
    title: 'text-red-50',
  },
  high: {
    card: 'border-l-orange-500 bg-orange-950/15 border-orange-900/30',
    badge: 'bg-orange-500/15 text-orange-400',
    title: 'text-orange-50',
  },
  moderate: {
    card: 'border-l-amber-500 bg-amber-950/10 border-slate-800/40',
    badge: 'bg-amber-500/15 text-amber-400',
    title: 'text-slate-200',
  },
  low: {
    card: 'border-l-slate-600 bg-slate-800/20 border-slate-800/30 opacity-80',
    badge: 'bg-slate-700 text-slate-300',
    title: 'text-slate-300',
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  compact = false,
  onClick,
  className,
}) => {
  const styles = SEVERITY_STYLES[incident.severity];

  return (
    <button
      onClick={() => onClick?.(incident)}
      className={cn(
        'w-full text-left rounded-lg border-l-4 border transition-all duration-200',
        'hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'cursor-pointer',
        styles.card,
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider', styles.badge)}>
            {TYPE_ICONS[incident.type]}
            {incident.type}
          </span>
          {incident.status !== 'open' && (
            <span className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded',
              incident.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-400' :
              incident.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400' :
              'bg-purple-500/15 text-purple-400'
            )}>
              {incident.status.replace('_', ' ')}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 font-medium font-mono-data shrink-0 ml-2">
          {timeAgo(incident.created_at)}
        </span>
      </div>

      {/* Title */}
      <p className={cn('font-semibold mb-2', compact ? 'text-sm' : 'text-base', styles.title)}>
        {incident.title}
      </p>

      {/* AI Triage */}
      {incident.triage && (
        <div className="p-2.5 bg-slate-950/50 rounded-md border border-slate-800/60">
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-blue-400 font-bold mr-1">AI Triage:</strong>
            {incident.triage.reasoning}
          </p>
          {!compact && incident.triage.nearest_teams[0] && (
            <div className="mt-2 flex items-center gap-3 text-[11px]">
              <span className="text-slate-400">
                📡 <strong className="text-slate-200">{incident.triage.nearest_teams[0].name}</strong>
              </span>
              <span className="text-emerald-400 font-mono-data font-semibold">
                ETA {incident.triage.nearest_teams[0].eta_seconds}s
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 font-medium">{incident.triage.recommended_playbook}</span>
            </div>
          )}
        </div>
      )}
    </button>
  );
};