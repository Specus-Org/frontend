import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { EntityItem } from './entity-item';
import type { ScreeningSearchResult } from '@specus/api-client';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt?: string }) => <span data-testid="entity-image" data-alt={alt} />,
}));

describe('EntityItem', () => {
  it('keeps the original card content while preventing text overflow on mobile', () => {
    const entity: ScreeningSearchResult = {
      id: 'entity-1',
      caption: 'Very Long Organization Name That Should Still Wrap Cleanly On Mobile',
      entity_type: 'organization',
      score: 0.92,
    };

    const { container } = render(<EntityItem entity={entity} />);

    const link = screen.getByRole('link', {
      name: /very long organization name that should still wrap cleanly on mobile/i,
    });
    const title = screen.getByRole('heading', {
      name: /very long organization name that should still wrap cleanly on mobile/i,
    });

    expect(link).toHaveAttribute('href', '/aml/search/entity-1');
    expect(link.className).toContain('min-w-0');
    expect(title.className).toContain('line-clamp-2');
    expect(title.className).toContain('break-words');
    expect(screen.getByTestId('entity-image')).toHaveAttribute(
      'data-alt',
      'Very Long Organization Name That Should Still Wrap Cleanly On Mobile',
    );
    expect(container.querySelector('a > div')?.className).toContain('min-w-0');
  });
});
