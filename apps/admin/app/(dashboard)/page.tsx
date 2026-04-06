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
import { Card, CardContent } from '@specus/ui/components/card';
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

  return { hasContent, loading, error };
}

// ---------- Quick action ----------
interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function QuickAction({ title, description, href, icon: Icon }: QuickActionProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-colors hover:border-primary/30">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{title}</p>
              <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your system at a glance.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Sanctions Sources"
          value={sources.count}
          description="Active screening databases"
          icon={Shield}
          loading={sources.loading}
          error={sources.error}
        />

        <MetricCard
          title="System Health"
          value={
            health.loading
              ? '...'
              : health.error
                ? '—'
                : health.healthy
                  ? 'Operational'
                  : 'Unreachable'
          }
          description="Backend API status"
          icon={Activity}
          loading={health.loading}
          error={health.error}
          href="/health"
        />

        <MetricCard
          title="Content"
          value={
            content.hasContent ? 'Active' : 'Empty'
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
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Manage Content"
            description="Create, edit, and publish articles and pages."
            href="/contents"
            icon={PenLine}
          />
          <QuickAction
            title="View Authors"
            description="Manage author profiles and linked content."
            href="/authors"
            icon={Users}
          />
          <QuickAction
            title="System Health"
            description="Monitor backend services and infrastructure."
            href="/health"
            icon={HeartPulse}
          />
        </div>
      </div>
    </div>
  );
}
