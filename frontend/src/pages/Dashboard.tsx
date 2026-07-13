import React from 'react';
import { StadiumMap } from '../components/StadiumMap';

export const MOCK_INCIDENTS = [
  { id: 'INC-1', type: 'MEDICAL', title: 'Fan collapsed near Section 204', time: '2 min ago', severity: 'critical', triage: 'Recommend PB-HEAT-STROKE. Nearest team MT-07 is 95s away.' },
  { id: 'INC-2', type: 'CROWD', title: 'Dense bottleneck at Gate East', time: '5 min ago', severity: 'high', triage: 'Recommend rerouting incoming fans to Gate North. Adjust digital signage.' },
  { id: 'INC-3', type: 'FACILITY', title: 'Spill reported in Concourse B', time: '12 min ago', severity: 'low', triage: 'Janitorial staff dispatched. Expected resolution 5m.' },
  { id: 'INC-4', type: 'SECURITY', title: 'Lost child at Info Desk 3', time: '14 min ago', severity: 'moderate', triage: 'Security team ST-02 engaged. Waiting for parents.' },
  { id: 'INC-5', type: 'CROWD', title: 'South Escalators over capacity', time: '18 min ago', severity: 'critical', triage: 'Recommend PB-CROWD-SURGE. Pause escalator entry.' },
  { id: 'INC-6', type: 'MEDICAL', title: 'Minor scrape reported', time: '22 min ago', severity: 'low', triage: 'Fan directed to First Aid Station.' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
      {/* Left Column: Map (7/12 = ~58%) */}
      <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
        <StadiumMap />
      </div>

      {/* Right Column: AI Triage & Timeline (5/12 = ~42%) */}
      <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
        <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 flex flex-col h-full">
          <div className="p-5 border-b border-slate-800 shrink-0">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Live Incidents Tracker
            </h3>
          </div>
          
          {/* Scrollable list area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {MOCK_INCIDENTS.map((inc) => (
              <button
                key={inc.id}
                className={`w-full text-left p-4 rounded-lg border-l-4 transition-all hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  inc.severity === 'critical' ? 'bg-red-950/20 border-l-red-500 border border-t-red-900/30 border-r-red-900/30 border-b-red-900/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' :
                  inc.severity === 'high' ? 'bg-orange-950/20 border-l-orange-500 border border-t-orange-900/30 border-r-orange-900/30 border-b-orange-900/30' :
                  inc.severity === 'moderate' ? 'bg-slate-800/50 border-l-yellow-500 border border-transparent' :
                  'bg-slate-800/30 border-l-slate-600 border border-transparent opacity-80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    inc.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {inc.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{inc.time}</span>
                </div>
                <p className={`font-semibold mb-3 ${
                  inc.severity === 'critical' ? 'text-red-50' : 'text-slate-200'
                }`}>
                  {inc.title}
                </p>
                <div className="p-2.5 bg-slate-950/50 rounded-md border border-slate-800/80">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-blue-400 font-bold mr-1">AI Triage:</strong> 
                    {inc.triage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
