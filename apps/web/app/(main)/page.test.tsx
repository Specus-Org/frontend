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
  it('renders the primary hero heading', async () => {
    render(await HomePage());

    expect(
      screen.getByRole('heading', { name: /building trust in global business/i }),
    ).toBeInTheDocument();
  });

  it('renders the primary calls to action', async () => {
    render(await HomePage());

    expect(screen.getAllByRole('link', { name: /get started/i })[0]).toHaveAttribute('href', '/aml');
    expect(screen.getAllByRole('link', { name: /contact us/i })[0]).toHaveAttribute(
      'href',
      'mailto:hello@specus.org',
    );
  });
});
