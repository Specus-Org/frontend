'use client';

import VisualBarChart from './VisualBarChart';

export interface DataPoint {
  key: string;
  value: number;
  percentage: number;
  barColor: string;
  strokeColor?: string;
}

interface VisualChartSectionProps {
  title: string;
  subtitle: string;
  data: DataPoint[];
  loading?: boolean;
  className?: string;
  labelSpacingType?: 'fixed' | 'normal';
}

export function VisualChartSection({
  title,
  subtitle,
  data,
  loading = false,
  className = '',
  labelSpacingType = 'normal',
}: VisualChartSectionProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-24 w-full animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`space-y-0.5 rounded-xl border p-4 ${className}`}>
      <h1 className="text-foreground text-start font-semibold">{title}</h1>
      <h3 className="text-muted-foreground mb-4 text-start text-sm">{subtitle}</h3>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <div className="bg-muted h-full w-full animate-pulse rounded" />
        </div>
      ) : (
        <VisualBarChart data={data} labelSpacingType={labelSpacingType} />
      )}
    </div>
  );
}
