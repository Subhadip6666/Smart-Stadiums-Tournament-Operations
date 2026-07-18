import { useState, useCallback } from 'react';
import type { RouteResult, NavigationMode } from '../types';
import { api, getMockRoute } from '../services/api';

interface UseRouteReturn {
  route: RouteResult | null;
  isLoading: boolean;
  error: string | null;
  findRoute: (from: string, to: string, mode?: NavigationMode) => Promise<void>;
  clearRoute: () => void;
}

export function useRoute(): UseRouteReturn {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const findRoute = useCallback(
    async (from: string, to: string, mode: NavigationMode = 'shortest') => {
      if (!from || !to || from === to) {
        setError('Please select different start and end locations.');
        return;
      }

      setIsLoading(true);
      setError(null);
      setRoute(null);

      try {
        // Try real API
        const response = await api.getRoute(from, to, 'metlife-stadium', mode);
        setRoute(response.data as RouteResult);
      } catch {
        // Fall back to mock
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        const mockResult = getMockRoute(from, to, mode);
        setRoute(mockResult);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return { route, isLoading, error, findRoute, clearRoute };
}