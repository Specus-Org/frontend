import React from 'react';
import { EntityItem } from '@/components/aml/entity-item';
import type { ScreeningSearchResult } from '@specus/api-client';

interface SearchResultListProps {
  entities: ScreeningSearchResult[];
}

export function SearchResultList({ entities }: SearchResultListProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="font-semibold">{entities.length} Potential</span>{' '}
        <span className="text-muted-foreground">records found</span>
      </p>
      <div className="grid grid-cols-3 gap-3">
        {entities.map((entity) => (
          <EntityItem key={entity.id} entity={entity} />
        ))}
      </div>
    </div>
  );
}
