import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SearchResultList } from './search-result-list';
import type { ScreeningSearchResult } from '@specus/api-client';

vi.mock('@/components/aml/entity-item', () => ({
  EntityItem: ({ entity }: { entity: ScreeningSearchResult }) => (
    <div data-testid="entity-item">{entity.caption}</div>
  ),
}));

describe('SearchResultList', () => {
  it('uses mobile-first result columns and scales up progressively', () => {
    const entities: ScreeningSearchResult[] = [
      {
        id: '1',
        caption: 'Entity One',
        entity_type: 'person',
        score: 0.9,
      },
      {
        id: '2',
        caption: 'Entity Two',
        entity_type: 'organization',
        score: 0.8,
      },
    ];

    const { container } = render(<SearchResultList entities={entities} />);

    expect(screen.getByText('2 Potential')).toBeInTheDocument();
    expect(screen.getByText('records found')).toBeInTheDocument();
    expect(screen.getAllByTestId('entity-item')).toHaveLength(2);

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('xl:grid-cols-3');
  });
});
