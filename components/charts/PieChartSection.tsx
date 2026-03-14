'use client';

import PieChart from './PieChart';
import { DataPoint } from './VisualChartSection';

interface PieChartSectionProps {
  title: string;
  subtitle: string;
  data: DataPoint[];
  loading?: boolean;
  className?: string;
}

export function PieChartSection({
  title,
  subtitle,
  data,
  loading = false,
  className = '',
}: PieChartSectionProps) {
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
      <PieChart data={data} />
    </div>
  );
}
