'use client';

import { BiographySection } from '@/components/aml/biography-section';
import { ListedInSection } from '@/components/aml/listed-in-section';
import { SearchResultHeader } from '@/components/aml/search-result-header';
import { Button } from '@/components/ui/button';
import { getScreeningEntity } from '@/services/generated';
import type { ScreeningEntity } from '@/services/generated';
import { Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function AMLEntityDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entity, setEntity] = useState<ScreeningEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    getScreeningEntity({ path: { id } })
      .then((response) => {
        if (!cancelled) {
          const data = response.data ?? null;
          setEntity(data);
          if (data?.caption) setQuery(data.caption);
        }
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
  }, [id]);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/aml/search?q=${encodeURIComponent(query.trim())}`);
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
          className="bg-brand hover:bg-brand/90 absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 transition-all duration-200 sm:right-2.5 sm:h-8 sm:w-8"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="py-8 space-y-8 mb-40">
        {loading && <DetailSkeleton />}

        {!loading && (error || !entity) && (
          <p className="text-sm text-red-600">
            {error ? 'Failed to load entity details. Please try again.' : 'Entity not found.'}
          </p>
        )}

        {!loading && !error && entity && <EntityDetail entity={entity} />}
      </div>
    </div>
  );
}

function EntityDetail({ entity }: { entity: ScreeningEntity }) {
  const sanctionsSources =
    entity.sanctions
      ?.map((s) => s.sanctions_list)
      .filter((s): s is NonNullable<typeof s> => s != null) ?? [];

  return (
    <>
      <SearchResultHeader name={entity.caption} status="Listed" />
      <BiographySection entityType={entity.entity_type} typeFields={entity.type_fields} />
      {sanctionsSources.length > 0 && <ListedInSection items={sanctionsSources} />}
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-gray-200" />
      <div className="h-5 w-24 rounded bg-gray-200" />
      <div className="flex flex-col gap-6 mt-8 sm:flex-row">
        <div className="h-24 w-24 rounded-lg bg-gray-200 shrink-0 sm:h-40 sm:w-40" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 w-full rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
