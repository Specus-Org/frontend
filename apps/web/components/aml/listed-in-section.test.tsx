import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { EntitySanction } from '@specus/api-client';
import { ListedInSection } from './listed-in-section';

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

describe('ListedInSection', () => {
  it('renders sanction rows in the requested order', () => {
    render(
      <ListedInSection
        items={[
          {
            event_type: 'sanction',
            is_active: true,
            program: 'OFAC SDN',
            designation_date: '2024-10-01',
            delisting_date: '2025-01-01',
            remarks: 'Review required',
            sanctions_list: {
              id: 'ofac',
              name: 'OFAC SDN List',
              authority: 'U.S. Department of Treasury',
              country_code: 'us',
            },
          } as EntitySanction,
        ]}
      />,
    );

    const labels = screen
      .getAllByText(/Program|Designation Date|Delisted Date|Remarks/)
      .map((element) => element.textContent);

    expect(labels).toEqual(['Program', 'Designation Date', 'Delisted Date', 'Remarks']);
  });

  it('omits empty sanction rows and renders a source link only when available', () => {
    render(
      <ListedInSection
        items={[
          {
            event_type: 'sanction',
            is_active: false,
            program: 'EU',
            remarks: 'Long remarks value',
            properties: {
              source_link: 'https://example.com/source',
            },
            sanctions_list: {
              id: 'eu',
              name: 'EU Restrictive Measures',
              authority: 'European Union',
              country_code: 'us',
            },
          } as EntitySanction,
          {
            event_type: 'pep',
            is_active: true,
            sanctions_list: {
              id: 'pep',
              name: 'PEP Register',
              authority: 'Interpol',
              country_code: 'fr',
            },
          } as EntitySanction,
        ]}
      />,
    );

    expect(screen.queryByText('Designation Date')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open source/i })).toHaveAttribute(
      'href',
      'https://example.com/source',
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
