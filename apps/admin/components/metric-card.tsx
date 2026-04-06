import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@specus/ui/components/card';
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
          ? 'transition-colors hover:border-primary/40 hover:shadow-md cursor-pointer'
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-8 w-24 rounded-md" />
        ) : error ? (
          <p className="text-sm text-muted-foreground">Failed to load</p>
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value}</div>
        )}
        {description && !loading && !error && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
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
