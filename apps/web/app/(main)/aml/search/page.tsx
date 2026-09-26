'use client';

import AmlSearchCard from '@/components/aml/aml-search-card';
import { AMLSearchLoadingState } from '@/components/aml/loading-states';
import { NoMatchesSection } from '@/components/aml/no-matches-section';
import { SearchResultList } from '@/components/aml/search-result-list';
import {
  type AmlSearchFilters,
  buildAmlSearchUrl,
  hasActiveFilters,
  parseAmlSearchFilters,
  type ScreeningTopicCode,
} from '@/lib/aml-search-params';
import { screeningSearch, ScreeningSearchResult } from '@specus/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const q = searchParams.get('q')?.trim() ?? '';
  const appliedFilters = parseAmlSearchFilters(searchParams);
  // Primitive keys so effects only re-run when the applied search actually changes.
  const topicsKey = appliedFilters.topics.join(',');
  const country = appliedFilters.country;

  const [query, setQuery] = useState(q);
  const [filters, setFilters] = useState<AmlSearchFilters>(appliedFilters);
  const [results, setResults] = useState<ScreeningSearchResult[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(Boolean(q));
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  // Bumped on every new query so in-flight responses from a previous query are discarded.
  const requestIdRef = useRef(0);

  // When the URL points at a new search, reset the form and results during render rather than
  // in an effect, so the stale results never paint (react.dev/learn/you-might-not-need-an-effect).
  const searchKey = buildAmlSearchUrl(q, appliedFilters);
  const [activeSearchKey, setActiveSearchKey] = useState(searchKey);
  if (activeSearchKey !== searchKey) {
    setActiveSearchKey(searchKey);
    setQuery(q);
    setFilters(appliedFilters);
    setResults([]);
    setNextCursor(null);
    setTotal(null);
    setHasMore(false);
    setError(false);
    setLoading(Boolean(q));
    setLoadingMore(false);
  }

  const searchQuery = useMemo(
    () => ({
      q,
      topics: topicsKey ? (topicsKey.split(',') as ScreeningTopicCode[]) : undefined,
      countries: country ? [country] : undefined,
    }),
    [q, topicsKey, country],
  );
  const isFiltered = hasActiveFilters(appliedFilters);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    if (!q) return;

    screeningSearch({ query: searchQuery })
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
        setTotal(data?.pagination?.total ?? null);
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
  }, [q, searchQuery, router]);

  const handleLoadMore = useCallback(() => {
    if (!q || !nextCursor || loadingMore) return;

    const requestId = requestIdRef.current;
    setLoadingMore(true);

    screeningSearch({ query: { ...searchQuery, cursor: nextCursor } })
      .then((response) => {
        if (requestIdRef.current !== requestId) return;
        const data = response.data;
        const items = data?.items ?? [];

        setResults((previous) => {
          const seen = new Set(previous.map((entity) => entity.id));
          return [...previous, ...items.filter((entity) => !seen.has(entity.id))];
        });
        setTotal((previous) => data?.pagination?.total ?? previous);
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
  }, [q, searchQuery, nextCursor, loadingMore]);

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    trackEvent('aml_search_submit', {
      source: 'results',
      'topics-count': filters.topics.length,
      country: filters.country,
    });
    router.replace(buildAmlSearchUrl(trimmedQuery, filters));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-8 md:py-8">
      <AmlSearchCard
        className="max-w-3xl"
        placement="results"
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
      />

      <div className="py-8 space-y-8 mb-40">
        {loading && <AMLSearchLoadingState />}

        {error && <p className="text-sm text-red-600">Failed to load results. Please try again.</p>}

        {q && !loading && !error && results.length === 0 && (
          <NoMatchesSection name={q} filtered={isFiltered} />
        )}

        {!loading && !error && results.length > 0 && (
          <SearchResultList
            entities={results}
            total={total ?? undefined}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>
    </div>
  );
}
