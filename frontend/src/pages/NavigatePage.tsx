import React, { useState } from 'react';
import { RouteMap } from '../components/navigation/RouteMap';
import { WayfindingPanel } from '../components/navigation/WayfindingPanel';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Loader';
import { useRoute } from '../hooks/useRoute';
import { getMockLocations } from '../services/api';
import type { NavigationMode } from '../types';
import { MapPin, Navigation, Accessibility, Leaf } from 'lucide-react';

const locations = getMockLocations();

export const NavigatePage: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState<NavigationMode>('shortest');
  const { route, isLoading, error, findRoute } = useRoute();

  const handleFind = () => {
    if (from && to) findRoute(from, to, mode);
  };

  return (
    <div className="flex-1 w-full max-w-[1100px] mx-auto p-3 lg:p-5 flex flex-col gap-4 overflow-hidden">
      {/* Controls */}
      <div className="glass-card p-5 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-blue-600/15 flex items-center justify-center">
            <Navigation className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Stadium Wayfinding</h2>
            <p className="text-xs text-slate-400">Dijkstra-powered shortest-path & sustainable transportation navigation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
          {/* From */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <select value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="" className="bg-slate-900">Select start</option>
                {locations.map((l) => <option key={l.id} value={l.id} className="bg-slate-900">{l.name}</option>)}
              </select>
            </div>
          </div>

          {/* To */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
              <select value={to} onChange={(e) => setTo(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="" className="bg-slate-900">Select destination</option>
                {locations.map((l) => <option key={l.id} value={l.id} className="bg-slate-900">{l.name}</option>)}
              </select>
            </div>
          </div>

          {/* Mode */}
          <div className="flex gap-1 bg-slate-800/40 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setMode('shortest')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${mode === 'shortest' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              Shortest
            </button>
            <button
              onClick={() => setMode('accessible')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${mode === 'accessible' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Accessibility className="h-3 w-3" /> Accessible
            </button>
            <button
              onClick={() => setMode('eco_transit')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${mode === 'eco_transit' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Leaf className="h-3 w-3 text-teal-300" /> Eco Transit
            </button>
          </div>

          <Button variant="primary" onClick={handleFind} disabled={!from || !to || from === to || isLoading}
            isLoading={isLoading} icon={<Navigation className="h-4 w-4" />}>
            Find Route
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}
        {route && (
          <>
            <RouteMap route={route} />
            <div className="glass-card p-5">
              <WayfindingPanel route={route} />
            </div>
          </>
        )}
        {!route && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-4">
              <Navigation className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Find Your Way</h3>
            <p className="text-sm text-slate-500 max-w-sm">Select start and destination points above to calculate the optimal route through the stadium.</p>
          </div>
        )}
      </div>
    </div>
  );
};