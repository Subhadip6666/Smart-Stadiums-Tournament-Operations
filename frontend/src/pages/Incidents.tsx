import React, { useEffect, useState } from 'react';
import { IncidentCard } from '../components/incidents/IncidentCard';
import { TriagePanel } from '../components/incidents/TriagePanel';
import { Timeline } from '../components/incidents/Timeline';
import { Modal } from '../components/common/Modal';
import { useIncidentStore } from '../stores/incidentStore';
import { getMockIncidents } from '../services/api';
import type { Incident } from '../types';
import { AlertTriangle } from 'lucide-react';

export const Incidents: React.FC = () => {
  const { incidents, setIncidents, filters, setFilter, getFilteredIncidents, getActiveCount, getCriticalCount } = useIncidentStore();
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    if (incidents.length === 0) setIncidents(getMockIncidents());
  }, [incidents.length, setIncidents]);

  const filtered = getFilteredIncidents();

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-3 lg:p-5 overflow-hidden flex flex-col gap-4">
      <div className="glass-card flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/60 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-600/15 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Incident Feed</h2>
              <p className="text-xs text-slate-400">
                {getActiveCount()} active • {getCriticalCount()} critical
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <select
              className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={filters.severity}
              onChange={(e) => setFilter('severity', e.target.value)}
            >
              <option value="ALL" className="bg-slate-900">All Severities</option>
              <option value="critical" className="bg-slate-900">Critical</option>
              <option value="high" className="bg-slate-900">High</option>
              <option value="moderate" className="bg-slate-900">Moderate</option>
              <option value="low" className="bg-slate-900">Low</option>
            </select>
            <select
              className="bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={filters.type}
              onChange={(e) => setFilter('type', e.target.value)}
            >
              <option value="ALL" className="bg-slate-900">All Types</option>
              <option value="MEDICAL" className="bg-slate-900">Medical</option>
              <option value="CROWD" className="bg-slate-900">Crowd</option>
              <option value="SECURITY" className="bg-slate-900">Security</option>
              <option value="FACILITY" className="bg-slate-900">Facility</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Incident List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((inc, i) => (
                <div key={inc.id} className="animate-slide-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <IncidentCard incident={inc} onClick={(i) => setSelected(i)} />
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-500 text-sm">
                No incidents match the selected filters.
              </div>
            )}
          </div>

          {/* Timeline Sidebar (desktop only) */}
          <div className="hidden xl:block w-64 border-l border-slate-800/60 p-4 overflow-y-auto custom-scrollbar">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Timeline</h4>
            <Timeline incidents={incidents} maxItems={10} />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title || ''}
        description={`${selected?.type} • ${selected?.severity?.toUpperCase()} • ${selected?.id}`}
        size="lg"
      >
        {selected && (
          <TriagePanel
            incident={selected}
            onDispatch={() => setSelected(null)}
            onEscalate={() => setSelected(null)}
            onResolve={() => setSelected(null)}
          />
        )}
      </Modal>
    </div>
  );
};
