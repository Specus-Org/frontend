import { Skeleton } from '@specus/ui/components/skeleton';

export default function ContentsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-[180px] rounded-md" />
        <Skeleton className="h-9 w-[180px] rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        {/* Header row */}
        <div className="flex items-center border-b px-4 py-3">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="ml-8 h-4 w-[80px]" />
          <Skeleton className="ml-8 h-4 w-[80px]" />
          <Skeleton className="ml-8 h-4 w-[100px]" />
          <Skeleton className="ml-8 h-4 w-[90px]" />
          <Skeleton className="ml-auto h-4 w-8" />
        </div>
        {/* Data rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center border-b px-4 py-3">
            <div className="w-[200px] space-y-1">
              <Skeleton className="h-4 w-[160px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
            <Skeleton className="ml-8 h-5 w-[80px] rounded-full" />
            <Skeleton className="ml-8 h-5 w-[70px] rounded-full" />
            <Skeleton className="ml-8 h-4 w-[90px]" />
            <Skeleton className="ml-8 h-4 w-[80px]" />
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
