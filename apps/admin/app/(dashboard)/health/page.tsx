'use client';

import { useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import useSWR from 'swr';
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

async function fetchEndpoint(
  check: 'live' | 'ready',
): Promise<EndpointState> {
  try {
    const res = await fetch(`/api/health?check=${check}`);
    const data = (await res.json()) as HealthResponse;

    if (res.ok) {
      return { status: 'healthy', data };
    }
    if (res.status === 503 && check === 'ready') {
      return { status: 'degraded', data };
    }
    return { status: 'unreachable', data: null };
  } catch {
    return { status: 'unreachable', data: null };
  }
}

interface HealthData {
  liveness: EndpointState;
  readiness: EndpointState;
  lastChecked: Date;
}

async function fetchHealth(): Promise<HealthData> {
  const [liveness, readiness] = await Promise.all([
    fetchEndpoint('live'),
    fetchEndpoint('ready'),
  ]);
  return { liveness, readiness, lastChecked: new Date() };
}

export default function HealthPage() {
  const { data, isLoading, isValidating, mutate } = useSWR<HealthData>(
    'health-status',
    fetchHealth,
    { refreshInterval: POLL_INTERVAL },
  );

  const handleManualRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const isRefreshing = isValidating && !isLoading;

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
          {data?.lastChecked && (
            <p className="text-sm text-muted-foreground">
              Last checked:{' '}
              {data.lastChecked.toLocaleString(undefined, {
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
          status={data?.liveness.status ?? 'healthy'}
          timestamp={data?.liveness.data?.timestamp}
          loading={isLoading}
        />
        <HealthDetailCard
          title="Readiness"
          status={data?.readiness.status ?? 'healthy'}
          timestamp={data?.readiness.data?.timestamp}
          checks={data?.readiness.data?.checks ?? undefined}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
