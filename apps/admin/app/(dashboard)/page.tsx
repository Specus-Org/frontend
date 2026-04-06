'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Activity,
  FileText,
  ArrowRight,
  PenLine,
  Users,
  HeartPulse,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@specus/ui/components/card';
import { Badge } from '@specus/ui/components/badge';
import { listScreeningSources, healthLive } from '@specus/api-client';
import { MetricCard } from '@/components/metric-card';

// ---------- Sources metric ----------
function useSourcesCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await listScreeningSources();
        if (!cancelled) {
          setCount(data?.sources?.length ?? 0);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { count, loading, error };
}

// ---------- Health metric ----------
function useHealthStatus() {
  const [healthy, setHealthy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await healthLive();
        if (!cancelled) {
          setHealthy(data?.status === 'ok' || data?.status === 'healthy');
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { healthy, loading, error };
}

// ---------- Content metric ----------
function useContentStatus() {
  const [hasContent, setHasContent] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/cms/contents?page_size=1');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) {
          const items = data?.items ?? [];
          setHasContent(items.length > 0);
          // Use next_cursor presence as an approximate "there's more" indicator
          setItemCount(
            items.length > 0
              ? data?.pagination?.next_cursor
                ? 2 // indicates "more than one page"
                : items.length
              : 0,
          );
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { hasContent, itemCount, loading, error };
}

// ---------- Quick action card ----------
interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function QuickAction({ title, description, href, icon: Icon }: QuickActionProps) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-3 pb-0">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
          <ArrowRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

// ---------- Dashboard page ----------
export default function DashboardPage() {
  const sources = useSourcesCount();
  const health = useHealthStatus();
  const content = useContentStatus();

  return (
    <div className="flex flex-1 flex-col space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your system at a glance.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Sanctions Sources"
          value={sources.count}
          description="Active screening databases"
          icon={Shield}
          loading={sources.loading}
          error={sources.error}
        />

        <div>
          <Link href="/health" className="block">
            <Card className="transition-colors hover:border-primary/40 hover:shadow-md cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  System Health
                </CardTitle>
                <Activity className="size-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                {health.loading ? (
                  <div className="h-8 flex items-center">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-accent" />
                  </div>
                ) : health.error ? (
                  <p className="text-sm text-muted-foreground">Failed to load</p>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant={health.healthy ? 'default' : 'destructive'}
                      className={
                        health.healthy
                          ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-400 hover:bg-emerald-500/15'
                          : undefined
                      }
                    >
                      <span
                        className={`mr-1 inline-block size-1.5 rounded-full ${
                          health.healthy ? 'bg-emerald-500' : 'bg-destructive'
                        }`}
                      />
                      {health.healthy ? 'Healthy' : 'Unreachable'}
                    </Badge>
                  </div>
                )}
                {!health.loading && !health.error && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Backend API status
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        <MetricCard
          title="Content"
          value={
            content.hasContent
              ? content.itemCount > 1
                ? `${content.itemCount}+ items`
                : '1 item'
              : 'Empty'
          }
          description={
            content.hasContent
              ? 'Content entries created'
              : 'No content yet'
          }
          icon={FileText}
          loading={content.loading}
          error={content.error}
          href="/contents"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Manage Content"
            description="Create, edit, and publish articles and pages."
            href="/contents"
            icon={PenLine}
          />
          <QuickAction
            title="View Authors"
            description="Manage author profiles and their linked content."
            href="/authors"
            icon={Users}
          />
          <QuickAction
            title="System Health"
            description="Monitor backend services and infrastructure status."
            href="/health"
            icon={HeartPulse}
          />
        </div>
      </div>
    </div>
  );
}
