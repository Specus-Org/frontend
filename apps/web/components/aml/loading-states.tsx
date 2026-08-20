import React from 'react';

const SEARCH_SKELETON_COUNT = 6;

export function AMLSearchLoadingState(): React.ReactElement {
  return (
    <div
      aria-busy="true"
      aria-label="Loading search results"
      role="status"
      className="grid animate-pulse grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: SEARCH_SKELETON_COUNT }).map((_, index) => (
        <div
          key={index}
          className="flex w-full min-w-0 items-center gap-3 rounded-2xl bg-slate-50 px-2 py-3"
        >
          <div className="h-24 w-24 shrink-0 rounded-lg bg-gray-200" />
          <div className="mx-3 min-w-0 flex-1 space-y-2">
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-5 w-3/5 rounded bg-gray-200" />
            <div className="h-4 w-2/5 rounded bg-gray-200" />
            <div className="h-5 w-16 rounded-full bg-gray-200" />
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
