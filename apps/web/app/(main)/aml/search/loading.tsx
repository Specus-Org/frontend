import { AMLSearchLoadingState } from '@/components/aml/loading-states';

export default function Loading(): React.ReactElement {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-8 md:py-8">
      {/* Only the search box is constrained; results span the full container. */}
      <div className="bg-muted max-w-3xl rounded-xl">
        <div className="relative rounded-xl border bg-white">
          <div className="h-[46px] w-full rounded-xl bg-gray-100 sm:h-[52px]" />
        </div>
        <div className="grid animate-pulse grid-cols-2 px-4 py-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-1">
              <div className="h-3 w-12 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-40 space-y-8 py-8">
        <AMLSearchLoadingState />
      </div>
    </div>
  );
}
