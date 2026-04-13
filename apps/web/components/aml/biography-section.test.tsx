import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BiographySection } from './biography-section';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt ?? ''} {...props} />
  ),
}));

describe('BiographySection', () => {
  it('renders arrays inline and nested objects as indented key-value rows', () => {
    render(
      <BiographySection
        entityType="person"
        typeFields={{
          nationalities: ['Indonesia', 'Singapore'],
          birth_date: '2026-04-03',
          place_of_birth: {
            city: 'Jakarta',
            country: 'Indonesia',
          },
        }}
      />,
    );

    expect(screen.getByText('Indonesia, Singapore')).toBeInTheDocument();
    expect(screen.getByText('April 3, 2026')).toBeInTheDocument();
    expect(screen.getByText('Place Of Birth:')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Jakarta')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
  });

  it('omits blank nested values and never renders object stringification', () => {
    render(
      <BiographySection
        entityType="organization"
        typeFields={{
          registration: {
            office: '',
            identifier: 'ABC-123',
          },
          aliases: [{ legal_name: 'Specus Holdings' }],
        }}
      />,
    );

    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
    expect(screen.queryByText('Office')).not.toBeInTheDocument();
    expect(screen.getByText('Registration:')).toBeInTheDocument();
    expect(screen.getByText('Identifier')).toBeInTheDocument();
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
    expect(screen.getByText('Legal Name: Specus Holdings')).toBeInTheDocument();
  });
});
