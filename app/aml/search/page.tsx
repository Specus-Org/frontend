'use client';

import { NoMatchesSection } from '@/components/aml/no-matches-section';
import { SearchResultList } from '@/components/aml/search-result-list';
import { Button } from '@/components/ui/button';
import { screeningSearch } from '@/services/generated';
import type { ScreeningSearchResult } from '@/services/generated';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

export default function AMLSearchPage(): React.ReactElement {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <AMLSearchContent />
    </Suspense>
  );
}

function AMLSearchContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<ScreeningSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    if (!q) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    screeningSearch({ query: { q } })
      .then((response) => {
        if (cancelled) return;
        const data = response.data;
        const items = data?.items ?? [];
        const queryType = data?.query_type;

        if (queryType === 'specific' && items.length === 1 && items[0].id) {
          router.replace(`/aml/search/${items[0].id}`);
          return;
        }

        setResults(items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  const handleSearch = () => {
    if (query.trim()) {
      router.replace(`/aml/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8">
      <div className="relative rounded-xl border bg-white transition-all focus-within:ring max-w-2xl">
        <input
          className="placeholder-muted-foreground w-full rounded-xl px-3 py-2.5 text-base font-normal outline-none sm:px-4 sm:py-3 sm:text-lg"
          onInput={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          value={query}
          placeholder="Search individual or entity name…"
        />

        <Button
          onClick={handleSearch}
          className="bg-brand cursor-pointer hover:bg-brand/90 absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 transition-all duration-200 sm:right-2.5 sm:h-8 sm:w-8"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="py-8 space-y-8 mb-40">
        {loading && <SearchSkeleton />}

        {error && <p className="text-sm text-red-600">Failed to load results. Please try again.</p>}

        {!loading && !error && results.length === 0 && <NoMatchesSection name={q} />}

        {!loading && !error && results.length > 0 && <SearchResultList entities={results} />}
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
          <div className="h-16 w-16 rounded-lg bg-gray-200 shrink-0 sm:h-24 sm:w-24" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
