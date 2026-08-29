import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@specus/ui/components/card';
import { Skeleton } from '@specus/ui/components/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  loading?: boolean;
  error?: boolean;
  href?: string;
}

export function MetricCard({
  title,
  value,
  description,
  loading,
  error,
  href,
}: MetricCardProps) {
  const content = (
    <Card className={href ? 'transition-colors hover:bg-muted/50 cursor-pointer' : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : error ? (
          <div className="text-2xl font-bold text-muted-foreground">—</div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && !loading ? (
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
