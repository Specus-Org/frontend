import { Suspense } from 'react';
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

import { MetricCard } from '@/components/metric-card';
import { fetchWithAuth, fetchBackend } from '@/lib/api-client';

// ---------- Async server metric components ----------

async function SourcesMetric() {
  try {
    const res = await fetchBackend('/api/v1/screening/sources');
    if (!res.ok) throw new Error();
    const data = await res.json();
    const count = data?.sources?.length ?? 0;
    return (
      <MetricCard
        title="Sanctions Sources"
        value={count}
        description="Active screening databases"
        icon={Shield}
      />
    );
  } catch {
    return (
      <MetricCard
        title="Sanctions Sources"
        value={0}
        description="Active screening databases"
        icon={Shield}
        error
      />
    );
  }
}

async function HealthMetric() {
  try {
    const res = await fetchBackend('/health/live');
    if (!res.ok) throw new Error();
    const data = await res.json();
    const healthy = data?.status === 'ok' || data?.status === 'healthy';
    return (
      <MetricCard
        title="System Health"
        value={healthy ? 'Operational' : 'Unreachable'}
        description="Backend API status"
        icon={Activity}
        href="/health"
      />
    );
  } catch {
    return (
      <MetricCard
        title="System Health"
        value="Unreachable"
        description="Backend API status"
        icon={Activity}
        error
        href="/health"
      />
    );
  }
}

async function ContentMetric() {
  try {
    const res = await fetchWithAuth('/api/v1/admin/cms/contents?page_size=1');
    if (!res.ok) throw new Error();
    const data = await res.json();
    const items = data?.items ?? [];
    const hasContent = items.length > 0;
    return (
      <MetricCard
        title="Content"
        value={hasContent ? 'Active' : 'Empty'}
        description={hasContent ? 'Content entries created' : 'No content yet'}
        icon={FileText}
        href="/contents"
      />
    );
  } catch {
    return (
      <MetricCard
        title="Content"
        value="—"
        description="Failed to load"
        icon={FileText}
        error
        href="/contents"
      />
    );
  }
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

// ---------- Dashboard page (Server Component) ----------
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your system at a glance.
        </p>
      </div>

      {/* Metric cards — each streams independently via Suspense */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<MetricCard title="Sanctions Sources" value={0} description="Active screening databases" icon={Shield} loading />}>
          <SourcesMetric />
        </Suspense>

        <Suspense fallback={<MetricCard title="System Health" value="..." description="Backend API status" icon={Activity} loading href="/health" />}>
          <HealthMetric />
        </Suspense>

        <Suspense fallback={<MetricCard title="Content" value="..." description="Loading..." icon={FileText} loading href="/contents" />}>
          <ContentMetric />
        </Suspense>
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
