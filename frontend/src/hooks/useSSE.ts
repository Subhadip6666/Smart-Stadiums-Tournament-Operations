import { useEffect, useRef, useCallback, useState } from 'react';

interface UseSSEOptions<T> {
  url: string;
  eventName?: string;
  onMessage: (data: T) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  enabled?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface UseSSEReturn {
  isConnected: boolean;
  error: string | null;
  reconnectCount: number;
}

export function useSSE<T = unknown>(options: UseSSEOptions<T>): UseSSEReturn {
  const {
    url,
    eventName = 'message',
    onMessage,
    onError,
    onOpen,
    enabled = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        setError(null);
        setReconnectCount(0);
        onOpen?.();
      };

      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as T;
          onMessageRef.current(data);
        } catch {
          // Malformed data, skip
        }
      };

      if (eventName === 'message') {
        es.onmessage = handler;
      } else {
        es.addEventListener(eventName, handler as EventListener);
      }

      es.onerror = (err) => {
        setIsConnected(false);
        setError('Connection lost');
        onError?.(err);
        es.close();

        setReconnectCount((prev) => {
          if (prev < reconnectAttempts) {
            const delay = Math.min(reconnectInterval * Math.pow(2, prev), 30000);
            reconnectTimeoutRef.current = setTimeout(connect, delay);
            return prev + 1;
          }
          setError('Max reconnection attempts reached');
          return prev;
        });
      };
    } catch {
      setError('Failed to connect');
    }
  }, [url, eventName, enabled, reconnectAttempts, reconnectInterval, onOpen, onError]);

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { isConnected, error, reconnectCount };
}