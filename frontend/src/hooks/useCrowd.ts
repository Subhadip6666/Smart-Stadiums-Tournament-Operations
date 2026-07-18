import { useEffect } from 'react';
import { useCrowdStore } from '../stores/crowdStore';

/**
 * Hook that drives the crowd density data for the stadium map.
 * Subscribes to the real-time Server-Sent Events (SSE) stream from the backend.
 */
export function useCrowd() {
  const { zones, isConnected, lastUpdated, subscribeToHeatmap } = useCrowdStore();

  useEffect(() => {
    // Subscribe to backend crowd density updates
    const unsubscribe = subscribeToHeatmap('metlife-stadium');

    return () => {
      unsubscribe();
    };
  }, [subscribeToHeatmap]);

  return {
    zones,
    isConnected,
    lastUpdated,
    overallStatus: useCrowdStore.getState().getOverallStatus(),
    criticalZones: useCrowdStore.getState().getCriticalZones(),
    totalOccupancy: useCrowdStore.getState().getTotalOccupancyPct(),
  };
}