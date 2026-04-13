import React from 'react';

export function AMLSearchLoadingState(): React.ReactElement {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
          <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200 sm:h-24 sm:w-24" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AMLEntityDetailLoadingState(): React.ReactElement {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-gray-200" />
      <div className="h-5 w-24 rounded bg-gray-200" />
      <div className="mt-8 flex flex-col gap-6 sm:flex-row">
        <div className="h-24 w-24 shrink-0 rounded-lg bg-gray-200 sm:h-40 sm:w-40" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-5 w-full rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
