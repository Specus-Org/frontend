export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
