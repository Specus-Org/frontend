'use client';

import { formatNumber } from '@/lib/helper';

interface StatCardProps {
  label: string;
  value: string | number;
  loading?: boolean;
  centered?: boolean;
}

export function StatCard({ label, value, loading, centered = false }: StatCardProps) {
  return (
    <div className={`inline-flex flex-1 flex-col gap-1 p-3 ${centered ? 'items-center' : ''}`}>
      <div
        className={`flex w-full items-center ${centered ? 'justify-center' : 'justify-between'}`}
      >
        <label className="text-muted-foreground text-sm">{label}</label>
      </div>
      <div className={`flex w-full flex-row ${centered ? 'justify-center' : 'justify-between'}`}>
        {loading ? (
          <div className="bg-muted h-7 w-16 animate-pulse rounded" />
        ) : (
          <p className="text-foreground text-xl font-semibold">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
        )}
      </div>
    </div>
  );
}
