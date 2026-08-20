import React from 'react';
import { EntityItem } from '@/components/aml/entity-item';
import { Button } from '@specus/ui/components/button';
import { Loader2 } from 'lucide-react';
import type { ScreeningSearchResult } from '@specus/api-client';
import { formatExactCount, formatRecordCount } from '@/lib/number-format';

interface SearchResultListProps {
  entities: ScreeningSearchResult[];
  /** Total matches across all pages, not just the loaded ones. */
  total?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function SearchResultList({
  entities,
  total,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: SearchResultListProps): React.ReactElement {
  return (
    <div className="space-y-3">
      {typeof total === 'number' && (
        <p className="text-sm" title={`${formatExactCount(total)} potential records`}>
          <span className="font-semibold">{formatRecordCount(total)} Potential</span>{' '}
          <span className="text-muted-foreground">
            {total === 1 ? 'record found' : 'records found'}
          </span>
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entities.map((entity) => (
          <EntityItem key={entity.id} entity={entity} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="cursor-pointer"
            data-umami-event="aml_search_load_more_click"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
