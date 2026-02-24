import React from 'react';

export default function HomePage(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6 sm:py-24 md:px-8 md:py-32 lg:py-48">
      <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        Under Development
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        We&apos;re building something great
      </h1>
      <p className="max-w-md text-muted-foreground sm:text-lg">
        This page is still in development. Check back soon for updates.
      </p>
    </div>
  );
}
