import { fireEvent, render, screen } from '@testing-library/react';
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

    expect(screen.getAllByTestId('entity-item')).toHaveLength(2);

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('xl:grid-cols-3');
  });

  it('renders a load more control only when more pages exist', () => {
    const entities: ScreeningSearchResult[] = [
      { id: '1', caption: 'Entity One', entity_type: 'person', score: 0.9 },
    ];
    const onLoadMore = vi.fn();

    const { rerender } = render(<SearchResultList entities={entities} />);
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();

    rerender(<SearchResultList entities={entities} hasMore onLoadMore={onLoadMore} />);
    const button = screen.getByRole('button', { name: /load more/i });
    fireEvent.click(button);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(<SearchResultList entities={entities} hasMore loadingMore onLoadMore={onLoadMore} />);
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('reports the total match count rather than the loaded count', () => {
    const entities: ScreeningSearchResult[] = [
      { id: '1', caption: 'Entity One', entity_type: 'person', score: 0.9 },
    ];

    const { rerender } = render(<SearchResultList entities={entities} total={842} />);
    expect(screen.getByText('842 Potential')).toBeInTheDocument();
    expect(screen.getByText('records found')).toBeInTheDocument();

    rerender(<SearchResultList entities={entities} total={1} />);
    expect(screen.getByText('record found')).toBeInTheDocument();

    rerender(<SearchResultList entities={entities} total={12500} />);
    expect(screen.getByText('12.5K Potential')).toBeInTheDocument();
    expect(screen.getByTitle('12,500 potential records')).toBeInTheDocument();
  });

  it('omits the count label when no total is supplied', () => {
    const entities: ScreeningSearchResult[] = [
      { id: '1', caption: 'Entity One', entity_type: 'person', score: 0.9 },
    ];

    render(<SearchResultList entities={entities} />);
    expect(screen.queryByText(/records found/)).not.toBeInTheDocument();
  });
});
