'use client';

import { AMLSearchLoadingState } from '@/components/aml/loading-states';
import { NoMatchesSection } from '@/components/aml/no-matches-section';
import { SearchResultList } from '@/components/aml/search-result-list';
import { screeningSearch, ScreeningSearchResult } from '@specus/api-client';
import { Button } from '@specus/ui/components/button';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function AMLSearchPage(): React.ReactElement {
  return (
    <Suspense fallback={<AMLSearchLoadingState />}>
      <AMLSearchContent />
    </Suspense>
  );
}

function AMLSearchContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<ScreeningSearchResult[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  // Bumped on every new query so in-flight responses from a previous query are discarded.
  const requestIdRef = useRef(0);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    setResults([]);
    setNextCursor(null);
    setHasMore(false);

    if (!q) return;

    setLoading(true);
    setError(false);

    screeningSearch({ query: { q } })
      .then((response) => {
        if (requestIdRef.current !== requestId) return;
        const data = response.data;
        const items = data?.items ?? [];
        const queryType = data?.query_type;

        if (queryType === 'specific' && items.length === 1 && items[0].id) {
          trackEvent('aml_search_result', {
            source: 'results',
            'result-count': items.length,
            'query-type': queryType,
            redirected: true,
          });
          router.replace(`/aml/search/${items[0].id}`);
          return;
        }

        trackEvent('aml_search_result', {
          source: 'results',
          'result-count': items.length,
          'query-type': queryType ?? 'unknown',
          redirected: false,
        });
        setResults(items);
        setNextCursor(data?.pagination?.next_cursor ?? null);
        setHasMore(Boolean(data?.pagination?.has_more && data?.pagination?.next_cursor));
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        trackEvent('aml_search_error', { source: 'results' });
        setError(true);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setLoading(false);
      });
  }, [q, router]);

  const handleLoadMore = useCallback(() => {
    if (!q || !nextCursor || loadingMore) return;

    const requestId = requestIdRef.current;
    setLoadingMore(true);

    screeningSearch({ query: { q, cursor: nextCursor } })
      .then((response) => {
        if (requestIdRef.current !== requestId) return;
        const data = response.data;
        const items = data?.items ?? [];

        setResults((previous) => {
          const seen = new Set(previous.map((entity) => entity.id));
          return [...previous, ...items.filter((entity) => !seen.has(entity.id))];
        });
        setNextCursor(data?.pagination?.next_cursor ?? null);
        setHasMore(Boolean(data?.pagination?.has_more && data?.pagination?.next_cursor));

        trackEvent('aml_search_load_more', {
          source: 'results',
          'result-count': items.length,
        });
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        trackEvent('aml_search_error', { source: 'load-more' });
        setHasMore(false);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setLoadingMore(false);
      });
  }, [q, nextCursor, loadingMore]);

  const handleSearch = () => {
    if (query.trim()) {
      trackEvent('aml_search_submit', { source: 'results' });
      router.replace(`/aml/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8">
      <div className="relative rounded-xl border bg-white transition-all focus-within:ring max-w-3xl">
        <input
          className="placeholder-muted-foreground w-full rounded-xl px-3 py-2.5 text-base font-normal outline-none sm:px-4 sm:py-3 sm:text-lg"
          onInput={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          value={query}
          placeholder="Search individual or entity name…"
          required
        />

        <Button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="bg-brand cursor-pointer hover:bg-brand/90 absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 transition-all duration-200 sm:right-2.5 sm:h-8 sm:w-8 disabled:opacity-50 disabled:cursor-not-allowed"
          data-umami-event="aml_search_button_click"
          data-umami-event-placement="results"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="py-8 space-y-8 mb-40">
        {loading && <AMLSearchLoadingState />}

        {error && <p className="text-sm text-red-600">Failed to load results. Please try again.</p>}

        {!loading && !error && results.length === 0 && <NoMatchesSection name={q} />}

        {!loading && !error && results.length > 0 && (
          <SearchResultList
            entities={results}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>
    </div>
  );
}
