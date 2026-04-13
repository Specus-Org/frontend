import { AMLSearchLoadingState } from '@/components/aml/loading-states';

export default function Loading(): React.ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8">
      <div className="max-w-3xl">
        <div className="relative rounded-xl border bg-white">
          <div className="h-[46px] w-full rounded-xl bg-gray-100 sm:h-[52px]" />
        </div>

        <div className="mb-40 space-y-8 py-8">
          <AMLSearchLoadingState />
        </div>
      </div>
    </div>
  );
}
