'use client';

import { BiographySection } from '@/components/aml/biography-section';
import { AMLEntityDetailLoadingState } from '@/components/aml/loading-states';
import { ListedInSection } from '@/components/aml/listed-in-section';
import { SearchResultHeader } from '@/components/aml/search-result-header';
import { getScreeningEntity, ScreeningEntity } from '@specus/api-client';
import { Button } from '@specus/ui/components/button';
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="max-w-3xl">
        <div className="relative rounded-xl border bg-white transition-all focus-within:ring">
          <input
            className="placeholder-muted-foreground w-full rounded-xl px-3 py-2.5 text-base font-normal outline-none sm:px-4 sm:py-3 sm:text-lg"
            onInput={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            value={query}
            disabled
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
          {loading && <AMLEntityDetailLoadingState />}

          {!loading && (error || !entity) && (
            <p className="text-sm text-red-600">
              {error ? 'Failed to load entity details. Please try again.' : 'Entity not found.'}
            </p>
          )}

          {!loading && !error && entity && <EntityDetail entity={entity} />}
        </div>
      </div>
    </div>
  );
}

function EntityDetail({ entity }: { entity: ScreeningEntity }) {
  return (
    <>
      <SearchResultHeader entity={entity} />
      <BiographySection entityType={entity.entity_type} typeFields={entity.type_fields} />
      {entity.sanctions.length > 0 && <ListedInSection items={entity.sanctions} />}
    </>
  );
}
