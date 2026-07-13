import React, { useEffect, useState } from 'react';
import { StadiumMap } from '../components/StadiumMap';
import { SituationReport } from '../components/dashboard/SituationReport';
import { NOCStats } from '../components/dashboard/NOCDashboard';
import { IncidentCard } from '../components/incidents/IncidentCard';
import { TriagePanel } from '../components/incidents/TriagePanel';
import { Modal } from '../components/common/Modal';
import { useCrowd } from '../hooks/useCrowd';
import { useIncidentStore } from '../stores/incidentStore';
import { getMockIncidents } from '../services/api';
import type { Incident, Zone } from '../types';

export const Dashboard: React.FC = () => {
  const { zones, overallStatus, totalOccupancy } = useCrowd();
  const { incidents, setIncidents, getFilteredIncidents, getActiveCount, getCriticalCount, getAvgResponseTime } = useIncidentStore();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  useEffect(() => {
    if (incidents.length === 0) {
      setIncidents(getMockIncidents());
    }
  }, [incidents.length, setIncidents]);

  const filtered = getFilteredIncidents();
  const activeCount = getActiveCount();
  const criticalCount = getCriticalCount();
  const avgResponse = getAvgResponseTime();

  return (
    <div className="flex-1 w-full max-w-[1800px] mx-auto p-3 lg:p-5 flex flex-col gap-4 overflow-hidden">
      {/* Situation Report Bar */}
      <div className="glass-card px-5 py-3 shrink-0">
        <SituationReport
          overallStatus={overallStatus}
          totalOccupancy={totalOccupancy}
          activeIncidents={activeCount}
        />
      </div>

      {/* KPI Stats Row */}
      <NOCStats
        totalOccupancy={totalOccupancy}
        activeIncidents={activeCount}
        criticalCount={criticalCount}
        avgResponseTime={avgResponse}
        className="shrink-0"
      />

      {/* Main Content: Map + Incidents */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Map */}
        <div className="lg:col-span-7 min-h-[400px] overflow-hidden">
          <StadiumMap
            zones={zones}
            onZoneClick={(z) => setSelectedZone(z)}
          />
        </div>

        {/* Live Incidents */}
        <div className="lg:col-span-5 flex flex-col glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 shrink-0">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <span className="status-dot status-dot-red" />
              Live Incidents
              <span className="ml-auto text-xs font-mono-data text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {activeCount} active
              </span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filtered.map((inc, i) => (
              <div key={inc.id} className="animate-slide-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <IncidentCard
                  incident={inc}
                  compact
                  onClick={(inc) => setSelectedIncident(inc)}
                />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">No active incidents</div>
            )}
          </div>
        </div>
      </div>

      {/* Incident Detail Modal */}
      <Modal
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.title || ''}
        description={`${selectedIncident?.type} • ${selectedIncident?.severity?.toUpperCase()}`}
        size="lg"
      >
        {selectedIncident && (
          <TriagePanel
            incident={selectedIncident}
            onDispatch={() => setSelectedIncident(null)}
            onEscalate={() => setSelectedIncident(null)}
            onResolve={() => setSelectedIncident(null)}
          />
        )}
      </Modal>

      {/* Zone Detail Modal */}
      <Modal
        isOpen={!!selectedZone}
        onClose={() => setSelectedZone(null)}
        title={selectedZone?.name || ''}
        description={`Zone ${selectedZone?.zone_id}`}
      >
        {selectedZone && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Current Density:</span>
              <span className={`text-sm font-bold uppercase ${
                selectedZone.density_bucket === 'critical' ? 'text-red-400' :
                selectedZone.density_bucket === 'high' ? 'text-orange-400' :
                selectedZone.density_bucket === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
              }`}>{selectedZone.density_bucket}</span>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-sm text-slate-300">
              <p>Coordinates: ({selectedZone.x}, {selectedZone.y})</p>
              <p className="mt-1">Last updated: {selectedZone.updated_at || 'Live'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
