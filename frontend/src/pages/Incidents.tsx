import React, { useState } from 'react';
import { MOCK_INCIDENTS } from './Dashboard';

export const Incidents: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const filteredIncidents = MOCK_INCIDENTS.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
    if (filterType !== 'ALL' && inc.type.toUpperCase() !== filterType.toUpperCase()) return false;
    return true;
  });

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-6 overflow-hidden flex flex-col">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 flex flex-col h-full overflow-hidden">
        
        {/* Header & Filters */}
        <div className="p-6 border-b border-slate-800 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Incident Feed</h2>
            <p className="text-sm text-slate-400 mt-1">Full historical and active incident tracker.</p>
          </div>
          <div className="flex gap-4">
            <select 
              className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
            <select 
              className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="MEDICAL">Medical</option>
              <option value="CROWD">Crowd</option>
              <option value="SECURITY">Security</option>
              <option value="FACILITY">Facility</option>
            </select>
          </div>
        </div>
        
        {/* Scrollable list area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-4">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`w-full text-left p-5 rounded-lg border-l-4 transition-all hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    inc.severity === 'critical' ? 'bg-red-950/20 border-l-red-500 border border-t-red-900/30 border-r-red-900/30 border-b-red-900/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' :
                    inc.severity === 'high' ? 'bg-orange-950/20 border-l-orange-500 border border-t-orange-900/30 border-r-orange-900/30 border-b-orange-900/30' :
                    inc.severity === 'moderate' ? 'bg-slate-800/50 border-l-yellow-500 border border-transparent' :
                    'bg-slate-800/30 border-l-slate-600 border border-transparent opacity-80'
                  }`}
                  tabIndex={0}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                        inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        inc.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {inc.type}
                      </span>
                      <span className="text-sm text-slate-400 font-medium">ID: {inc.id}</span>
                    </div>
                    <span className="text-sm text-slate-400 font-medium">{inc.time}</span>
                  </div>
                  <p className={`font-bold text-lg mb-4 ${
                    inc.severity === 'critical' ? 'text-red-50' : 'text-slate-200'
                  }`}>
                    {inc.title}
                  </p>
                  <div className="p-3 bg-slate-950/50 rounded-md border border-slate-800/80">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong className="text-blue-400 font-bold mr-2">AI Triage Recommendation:</strong> 
                      {inc.triage}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-500">
                No incidents match the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
