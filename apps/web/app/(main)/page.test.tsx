import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import HomePage from './page';

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

describe('HomePage', () => {
  it('renders the landing page with the primary brand and proof metrics', async () => {
    render(await HomePage());

    expect(
      screen.getByRole('heading', {
        name: /build ethical procurement with intelligence you can verify/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('3+')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('<5s')).toBeInTheDocument();
  });

  it('renders the primary calls to action and key section landmarks', async () => {
    render(await HomePage());

    expect(screen.getByRole('link', { name: /start a screening/i })).toHaveAttribute(
      'href',
      '/aml',
    );
    expect(screen.getByRole('link', { name: /contact specus/i })).toHaveAttribute(
      'href',
      'mailto:hello@specus.org',
    );
    expect(
      screen.getByRole('heading', { name: /solutions built for modern procurement teams/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /how specus works/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /2026 roadmap/i })).toBeInTheDocument();
  });
});
