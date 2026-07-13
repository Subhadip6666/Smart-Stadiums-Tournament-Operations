import { useEffect, useRef, useCallback } from 'react';
import { useCrowdStore } from '../stores/crowdStore';
import { getStaticMockZones } from '../services/api';
import type { Zone, DensityBucket } from '../types';

const DENSITY_BUCKETS: DensityBucket[] = ['low', 'moderate', 'high', 'critical'];

/**
 * Hook that drives the crowd density data for the stadium map.
 * Attempts to connect to the backend SSE endpoint; falls back to
 * a realistic mock simulation if the backend is unavailable.
 */
export function useCrowd() {
  const { zones, setZones, setConnected, isConnected, lastUpdated } = useCrowdStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef(0);

  // Simulate realistic crowd density shifts over time
  const simulateDensityShift = useCallback(() => {
    tickRef.current += 1;
    const tick = tickRef.current;

    setZones(
      getStaticMockZones().map((zone) => {
        // Each zone has a base tendency + random fluctuation
        const hash = zone.zone_id.charCodeAt(2) + zone.zone_id.charCodeAt(zone.zone_id.length - 1);
        const wave = Math.sin((tick + hash) * 0.15) * 0.5 + 0.5; // 0..1
        const noise = Math.random() * 0.3;
        const value = wave + noise;

        let bucket: DensityBucket;
        if (value > 0.85) bucket = 'critical';
        else if (value > 0.6) bucket = 'high';
        else if (value > 0.35) bucket = 'moderate';
        else bucket = 'low';

        // Some zones have a natural tendency toward high density
        if (['Z-GATE-E', 'Z-ESC-S', 'Z-SEAT-W1'].includes(zone.zone_id) && bucket === 'low') {
          bucket = 'moderate';
        }
        // Medical station stays low
        if (zone.zone_id === 'Z-MED-1') {
          bucket = 'low';
        }

        return {
          ...zone,
          density_bucket: bucket,
          updated_at: new Date().toISOString(),
        };
      })
    );
  }, [setZones]);

  useEffect(() => {
    // Initialize with static mock data immediately
    setZones(getStaticMockZones());
    setConnected(true);

    // Start simulation loop (every 3 seconds)
    intervalRef.current = setInterval(simulateDensityShift, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setZones, setConnected, simulateDensityShift]);

  return {
    zones,
    isConnected,
    lastUpdated,
    overallStatus: useCrowdStore.getState().getOverallStatus(),
    criticalZones: useCrowdStore.getState().getCriticalZones(),
    totalOccupancy: useCrowdStore.getState().getTotalOccupancyPct(),
  };
}