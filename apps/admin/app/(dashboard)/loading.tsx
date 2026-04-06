import { Skeleton } from '@specus/ui/components/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col space-y-8">
      {/* Heading skeleton */}
      <div>
        <Skeleton className="h-9 w-48 rounded-md" />
        <Skeleton className="mt-2 h-4 w-72 rounded-md" />
      </div>

      {/* Metric cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>

      {/* Quick actions heading skeleton */}
      <div>
        <Skeleton className="mb-4 h-6 w-36 rounded-md" />
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
