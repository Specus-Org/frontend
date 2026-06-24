import { Suspense } from 'react';
import Link from 'next/link';
import {
  PenLine,
  Users,
  HeartPulse,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@specus/ui/components/card';
import { Separator } from '@specus/ui/components/separator';

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
      />
    );
  } catch {
    return (
      <MetricCard
        title="Sanctions Sources"
        value="—"
        description="Could not load"
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
        value={healthy ? 'Operational' : 'Degraded'}
        description="Backend API status"
        href="/health"
      />
    );
  } catch {
    return (
      <MetricCard
        title="System Health"
        value="Unreachable"
        description="Backend API status"
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
        href="/contents"
      />
    );
  } catch {
    return (
      <MetricCard
        title="Content"
        value="—"
        description="Could not load"
        error
        href="/contents"
      />
    );
  }
}

// ---------- Nav link ----------
interface NavLinkProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function NavLink({ title, description, href, icon: Icon }: NavLinkProps) {
  return (
    <Link href={href} className="group flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

// ---------- Dashboard page (Server Component) ----------
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<MetricCard title="Sanctions Sources" value="…" loading />}>
          <SourcesMetric />
        </Suspense>
        <Suspense fallback={<MetricCard title="System Health" value="…" loading href="/health" />}>
          <HealthMetric />
        </Suspense>
        <Suspense fallback={<MetricCard title="Content" value="…" loading href="/contents" />}>
          <ContentMetric />
        </Suspense>
      </div>

      <Card>
        <CardContent className="px-4 py-2">
          <NavLink
            title="Manage Content"
            description="Create, edit, and publish articles and pages."
            href="/contents"
            icon={PenLine}
          />
          <Separator />
          <NavLink
            title="Authors"
            description="Manage author profiles and linked content."
            href="/authors"
            icon={Users}
          />
          <Separator />
          <NavLink
            title="System Health"
            description="Monitor backend services and infrastructure."
            href="/health"
            icon={HeartPulse}
          />
        </CardContent>
      </Card>
    </div>
  );
}
