import { create } from 'zustand';
import type { Incident, IncidentSeverity, IncidentType, IncidentStatus } from '../types';

interface FilterState {
  severity: IncidentSeverity | 'ALL';
  type: IncidentType | 'ALL';
  status: IncidentStatus | 'ALL';
}

interface IncidentState {
  incidents: Incident[];
  filters: FilterState;
  selectedId: string | null;

  // Actions
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  updateStatus: (id: string, status: IncidentStatus) => void;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
  selectIncident: (id: string | null) => void;

  // Selectors
  getFilteredIncidents: () => Incident[];
  getSelectedIncident: () => Incident | undefined;
  getActiveCount: () => number;
  getCriticalCount: () => number;
  getAvgResponseTime: () => number;
}

const SEVERITY_ORDER: Record<IncidentSeverity, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

const DEFAULT_FILTERS: FilterState = {
  severity: 'ALL',
  type: 'ALL',
  status: 'ALL',
};

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [],
  filters: { ...DEFAULT_FILTERS },
  selectedId: null,

  setIncidents: (incidents) => set({ incidents }),

  addIncident: (incident) =>
    set((state) => ({ incidents: [incident, ...state.incidents] })),

  updateStatus: (id, status) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, status, updated_at: new Date().toISOString() } : inc
      ),
    })),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  selectIncident: (id) => set({ selectedId: id }),

  getFilteredIncidents: () => {
    const { incidents, filters } = get();
    return incidents
      .filter((inc) => {
        if (filters.severity !== 'ALL' && inc.severity !== filters.severity) return false;
        if (filters.type !== 'ALL' && inc.type !== filters.type) return false;
        if (filters.status !== 'ALL' && inc.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by severity first, then by time (newest first)
        const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        if (sevDiff !== 0) return sevDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  },

  getSelectedIncident: () => {
    const { incidents, selectedId } = get();
    return incidents.find((inc) => inc.id === selectedId);
  },

  getActiveCount: () =>
    get().incidents.filter((inc) => inc.status === 'open' || inc.status === 'in_progress').length,

  getCriticalCount: () =>
    get().incidents.filter((inc) => inc.severity === 'critical' && inc.status !== 'resolved').length,

  getAvgResponseTime: () => {
    const incidents = get().incidents;
    if (incidents.length === 0) return 0;
    const totalEta = incidents
      .filter((inc) => inc.triage?.nearest_teams?.[0])
      .reduce((sum, inc) => sum + (inc.triage!.nearest_teams[0].eta_seconds || 0), 0);
    const count = incidents.filter((inc) => inc.triage?.nearest_teams?.[0]).length;
    return count > 0 ? Math.round(totalEta / count) : 0;
  },
}));