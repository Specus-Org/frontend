import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@specus/ui/components/card';
import { Skeleton } from '@specus/ui/components/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  loading?: boolean;
  error?: boolean;
  href?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  error,
  href,
}: MetricCardProps) {
  const content = (
    <Card
      className={
        href
          ? 'transition-colors hover:border-primary/30 cursor-pointer'
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : error ? (
          <p className="text-sm text-muted-foreground">Failed to load</p>
        ) : (
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        )}
        {description && !loading && !error ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
