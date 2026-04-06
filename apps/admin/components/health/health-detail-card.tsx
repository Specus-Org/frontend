import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@specus/ui/components/card';
import { Badge } from '@specus/ui/components/badge';
import { Skeleton } from '@specus/ui/components/skeleton';
import { HealthCheckItem } from './health-check-item';

export type HealthStatus = 'healthy' | 'degraded' | 'unreachable';

interface HealthDetailCardProps {
  title: string;
  status: HealthStatus;
  timestamp?: string;
  checks?: Record<string, string>;
  loading?: boolean;
}

const statusConfig: Record<
  HealthStatus,
  { label: string; icon: LucideIcon; badgeClass: string; ringClass: string }
> = {
  healthy: {
    label: 'Healthy',
    icon: CheckCircle2,
    badgeClass:
      'border-green-4/30 bg-green-0 text-green-4 dark:bg-green-4/10',
    ringClass: 'ring-green-4/20',
  },
  degraded: {
    label: 'Degraded',
    icon: AlertTriangle,
    badgeClass:
      'border-yellow-4/30 bg-yellow-0 text-yellow-4 dark:bg-yellow-4/10',
    ringClass: 'ring-yellow-4/20',
  },
  unreachable: {
    label: 'Unreachable',
    icon: XCircle,
    badgeClass: 'border-red-4/30 bg-red-0 text-red-4 dark:bg-red-4/10',
    ringClass: 'ring-red-4/20',
  },
};

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  } catch {
    return timestamp;
  }
}

export function HealthDetailCard({
  title,
  status,
  timestamp,
  checks,
  loading,
}: HealthDetailCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const checkEntries = checks ? Object.entries(checks) : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline" className={config.badgeClass}>
            <Icon className="size-3" />
            {config.label}
          </Badge>
        </div>
        {timestamp && (
          <CardDescription>
            Last checked: {formatTimestamp(timestamp)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {status === 'unreachable' && (
          <p className="text-sm text-red-4">
            Cannot reach API. The server may be down or the network connection is
            unavailable.
          </p>
        )}
        {checkEntries.length > 0 && (
          <div className="divide-y divide-border">
            {checkEntries.map(([name, value]) => (
              <HealthCheckItem key={name} name={name} status={value} />
            ))}
          </div>
        )}
        {status === 'healthy' && checkEntries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            All systems operational.
          </p>
        )}
        {status === 'degraded' && checkEntries.length === 0 && (
          <p className="text-sm text-yellow-4">
            Service is running but not fully ready.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
