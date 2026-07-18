import { create } from 'zustand';
import type { Zone, DensityBucket, CrowdUpdate } from '../types';
import { getStaticMockZones } from '../services/api';

interface CrowdState {
  zones: Zone[];
  lastUpdated: Date | null;
  isConnected: boolean;

  // Actions
  setZones: (zones: Zone[]) => void;
  updateZone: (zoneId: string, density: DensityBucket) => void;
  handleCrowdUpdate: (update: CrowdUpdate) => void;
  setConnected: (connected: boolean) => void;
  subscribeToHeatmap: (stadiumId: string) => () => void;

  // Selectors
  getZoneById: (zoneId: string) => Zone | undefined;
  getCriticalZones: () => Zone[];
  getOverallStatus: () => 'operational' | 'degraded' | 'critical';
  getZonesByDensity: (bucket: DensityBucket) => Zone[];
  getTotalOccupancyPct: () => number;
}

export const useCrowdStore = create<CrowdState>((set, get) => ({
  zones: [],
  lastUpdated: null,
  isConnected: false,

  setZones: (zones) =>
    set({ zones, lastUpdated: new Date() }),

  updateZone: (zoneId, density) =>
    set((state) => ({
      zones: state.zones.map((z) =>
        z.zone_id === zoneId ? { ...z, density_bucket: density, updated_at: new Date().toISOString() } : z
      ),
      lastUpdated: new Date(),
    })),

  handleCrowdUpdate: (update) => {
    const { zones: currentZones } = get();
    // Ensure initial static coordinates/names are loaded if they are missing
    const baseZones = currentZones.length > 0 ? currentZones : getStaticMockZones();
    const updatedMap = new Map(update.zones.map((z) => [z.zone_id, z]));

    const merged = baseZones.map((z) => {
      const updated = updatedMap.get(z.zone_id);
      return updated ? { ...z, ...updated } : z;
    });

    set({ zones: merged, lastUpdated: new Date() });
  },

  setConnected: (connected) => set({ isConnected: connected }),

  subscribeToHeatmap: (stadiumId) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${API_BASE}/v1/crowd/heatmap?stadium_id=${encodeURIComponent(stadiumId)}`;
    
    // Initialize base zones with mock coordinates/names if currently empty
    if (get().zones.length === 0) {
      set({ zones: getStaticMockZones() });
    }

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      set({ isConnected: true });
    };

    eventSource.addEventListener('density_update', (event) => {
      try {
        console.log('SSE [density_update] event received:', event.data);
        const data = JSON.parse(event.data) as CrowdUpdate;
        get().handleCrowdUpdate(data);
      } catch (err) {
        console.error('Error parsing SSE crowd update:', err);
      }
    });

    eventSource.onerror = () => {
      set({ isConnected: false });
    };

    return () => {
      eventSource.close();
      set({ isConnected: false });
    };
  },

  getZoneById: (zoneId) => get().zones.find((z) => z.zone_id === zoneId),

  getCriticalZones: () =>
    get().zones.filter((z) => z.density_bucket === 'critical'),

  getOverallStatus: () => {
    const zones = get().zones;
    if (zones.length === 0) return 'operational';
    const criticalCount = zones.filter((z) => z.density_bucket === 'critical').length;
    const highCount = zones.filter((z) => z.density_bucket === 'high').length;
    if (criticalCount >= 2) return 'critical';
    if (criticalCount >= 1 || highCount >= 3) return 'degraded';
    return 'operational';
  },

  getZonesByDensity: (bucket) =>
    get().zones.filter((z) => z.density_bucket === bucket),

  getTotalOccupancyPct: () => {
    const zones = get().zones;
    if (zones.length === 0) return 0;
    const densityWeights: Record<DensityBucket, number> = {
      low: 25,
      moderate: 55,
      high: 78,
      critical: 95,
    };
    const total = zones.reduce((sum, z) => sum + (z.capacity_pct || densityWeights[z.density_bucket]), 0);
    return Math.round(total / zones.length);
  },
}));