'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import type { HealthResponse } from '@specus/api-client';
import {
  HealthDetailCard,
  type HealthStatus,
} from '@/components/health/health-detail-card';

const POLL_INTERVAL = 30_000;

interface EndpointState {
  status: HealthStatus;
  data: HealthResponse | null;
}

const initialState: EndpointState = {
  status: 'healthy',
  data: null,
};

export default function HealthPage() {
  const [liveness, setLiveness] = useState<EndpointState>(initialState);
  const [readiness, setReadiness] = useState<EndpointState>(initialState);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEndpoint = async (
    check: 'live' | 'ready',
  ): Promise<{ status: HealthStatus; data: HealthResponse | null }> => {
    try {
      const res = await fetch(`/api/health?check=${check}`);
      const data = (await res.json()) as HealthResponse;

      if (res.ok) {
        return { status: 'healthy', data };
      }
      // 503 from readiness means degraded (still reachable)
      if (res.status === 503 && check === 'ready') {
        return { status: 'degraded', data };
      }
      return { status: 'unreachable', data: null };
    } catch {
      return { status: 'unreachable', data: null };
    }
  };

  const fetchHealth = useCallback(async (isInitial = false) => {
    if (!isInitial) {
      setIsRefreshing(true);
    }

    const [liveResult, readyResult] = await Promise.all([
      fetchEndpoint('live'),
      fetchEndpoint('ready'),
    ]);

    setLiveness(liveResult);
    setReadiness(readyResult);
    setLastChecked(new Date());
    setIsRefreshing(false);
    if (isInitial) {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth(true);

    intervalRef.current = setInterval(() => {
      fetchHealth(false);
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchHealth]);

  const handleManualRefresh = () => {
    // Reset the interval so the next auto-poll is a full 30s from now
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    fetchHealth(false);
    intervalRef.current = setInterval(() => {
      fetchHealth(false);
    }, POLL_INTERVAL);
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              System Health
            </h1>
            {isRefreshing && (
              <RefreshCw className="size-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
          {lastChecked && (
            <p className="text-sm text-muted-foreground">
              Last checked:{' '}
              {lastChecked.toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'medium',
              })}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="w-fit"
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Health cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <HealthDetailCard
          title="Liveness"
          status={liveness.status}
          timestamp={liveness.data?.timestamp}
          loading={initialLoading}
        />
        <HealthDetailCard
          title="Readiness"
          status={readiness.status}
          timestamp={readiness.data?.timestamp}
          checks={readiness.data?.checks ?? undefined}
          loading={initialLoading}
        />
      </div>
    </div>
  );
}
