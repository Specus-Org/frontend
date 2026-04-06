import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@specus/ui/components/badge';

interface HealthCheckItemProps {
  name: string;
  status: string;
}

function isHealthy(status: string): boolean {
  const normalized = status.toLowerCase();
  return normalized === 'ok' || normalized === 'healthy' || normalized === 'up';
}

export function HealthCheckItem({ name, status }: HealthCheckItemProps) {
  const healthy = isHealthy(status);

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-foreground">{name}</span>
      <Badge
        variant="outline"
        className={
          healthy
            ? 'border-green-4/30 bg-green-0 text-green-4 dark:bg-green-4/10'
            : 'border-red-4/30 bg-red-0 text-red-4 dark:bg-red-4/10'
        }
      >
        {healthy ? (
          <CheckCircle2 className="size-3" />
        ) : (
          <XCircle className="size-3" />
        )}
        {status}
      </Badge>
    </div>
  );
}
