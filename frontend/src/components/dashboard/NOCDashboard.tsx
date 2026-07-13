import React from 'react';
import { cn } from '../../utils/cn';
import { Users, AlertTriangle, Clock, MessageSquare } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  glowClass?: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon, trend, color, glowClass }) => (
  <div className={cn('glass-card p-4 flex flex-col gap-2', glowClass)}>
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400 uppercase font-medium tracking-wider">{label}</span>
      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', color)}>{icon}</div>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold font-mono-data text-slate-100 animate-count-up">{value}</span>
      {trend && <span className="text-xs text-slate-400 mb-1">{trend}</span>}
    </div>
  </div>
);

interface NOCStatsProps {
  totalOccupancy: number;
  activeIncidents: number;
  criticalCount: number;
  avgResponseTime: number;
  className?: string;
}

export const NOCStats: React.FC<NOCStatsProps> = ({
  totalOccupancy, activeIncidents, criticalCount, avgResponseTime, className,
}) => {
  return (
    <div className={cn('grid grid-cols-2 xl:grid-cols-4 gap-3', className)}>
      <KPICard
        label="Occupancy"
        value={`${totalOccupancy}%`}
        icon={<Users className="h-4 w-4 text-blue-400" />}
        color="bg-blue-600/15"
        trend="78,212 / 82,500"
      />
      <KPICard
        label="Active Incidents"
        value={activeIncidents}
        icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
        color="bg-amber-600/15"
        trend={criticalCount > 0 ? `${criticalCount} critical` : 'None critical'}
        glowClass={criticalCount > 0 ? 'noc-glow-amber' : undefined}
      />
      <KPICard
        label="Avg Response"
        value={`${avgResponseTime}s`}
        icon={<Clock className="h-4 w-4 text-emerald-400" />}
        color="bg-emerald-600/15"
        trend="Target: <120s"
      />
      <KPICard
        label="AI Queries"
        value="1,247"
        icon={<MessageSquare className="h-4 w-4 text-purple-400" />}
        color="bg-purple-600/15"
        trend="12 languages"
      />
    </div>
  );
};