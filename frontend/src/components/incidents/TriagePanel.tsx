import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { AlertTriangle, Clock, BookOpen, Users, CheckCircle, ArrowUpRight } from 'lucide-react';
import type { Incident } from '../../types';

interface TriagePanelProps {
  incident: Incident;
  onDispatch?: () => void;
  onEscalate?: () => void;
  onResolve?: () => void;
  className?: string;
}

export const TriagePanel: React.FC<TriagePanelProps> = ({
  incident,
  onDispatch,
  onEscalate,
  onResolve,
  className,
}) => {
  const triage = incident.triage;
  if (!triage) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* AI Analysis */}
      <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-900/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-md bg-blue-600/20 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <h4 className="text-sm font-semibold text-blue-300">AI Triage Analysis</h4>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{triage.reasoning}</p>
      </div>

      {/* Playbook */}
      <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Recommended Playbook</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-950/30 border border-cyan-900/30 text-cyan-300 text-sm font-mono-data font-semibold">
          {triage.recommended_playbook}
        </span>
      </div>

      {/* Response Teams */}
      <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">Nearest Response Teams</span>
        </div>
        <div className="space-y-2">
          {triage.nearest_teams.map((team) => (
            <div
              key={team.team_id}
              className="flex items-center justify-between p-3 rounded-md bg-slate-900/60 border border-slate-800/40"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">{team.name}</p>
                <p className="text-xs text-slate-400">{team.team_id} • {team.zone}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-mono-data font-semibold text-emerald-400">{team.eta_seconds}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="primary" size="md" onClick={onDispatch} className="flex-1" icon={<Users className="h-4 w-4" />}>
          Dispatch
        </Button>
        <Button variant="outline" size="md" onClick={onEscalate} icon={<ArrowUpRight className="h-4 w-4" />}>
          Escalate
        </Button>
        <Button variant="ghost" size="md" onClick={onResolve} icon={<CheckCircle className="h-4 w-4" />}>
          Resolve
        </Button>
      </div>
    </div>
  );
};