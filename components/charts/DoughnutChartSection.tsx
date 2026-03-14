'use client';

import DoughnutChart from './DoughnutChart';
import { DataPoint } from './VisualChartSection';

interface DoughnutChartSectionProps {
  title: string;
  subtitle: string;
  data: DataPoint[];
  loading?: boolean;
  className?: string;
  centerLabel?: string;
}

export function DoughnutChartSection({
  title,
  subtitle,
  data,
  loading = false,
  className = '',
  centerLabel,
}: DoughnutChartSectionProps) {
  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="space-y-1">
          <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-52 w-full animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`space-y-0.5 rounded-xl border p-4 ${className}`}>
      <h1 className="text-foreground text-start font-semibold">{title}</h1>
      <h3 className="text-muted-foreground mb-4 text-start text-sm">{subtitle}</h3>
      <DoughnutChart data={data} centerLabel={centerLabel} />
    </div>
  );
}
