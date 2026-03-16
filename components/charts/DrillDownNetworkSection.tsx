'use client';

import DrillDownNetwork, { NetworkNode } from './DrillDownNetwork';

interface DrillDownNetworkSectionProps {
  title: string;
  subtitle: string;
  data: NetworkNode;
  loading?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function DrillDownNetworkSection({
  title,
  subtitle,
  data,
  loading = false,
  valueFormatter,
  className = '',
}: DrillDownNetworkSectionProps) {
  if (loading) {
    return (
      <div className={`rounded-xl border p-4 space-y-3 ${className}`}>
        <div className="space-y-1">
          <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-64 w-full animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 space-y-0.5 ${className}`}>
      <h1 className="text-foreground text-start font-semibold">{title}</h1>
      <h3 className="text-muted-foreground text-start text-sm mb-4">{subtitle}</h3>
      <DrillDownNetwork data={data} valueFormatter={valueFormatter} />
    </div>
  );
}
