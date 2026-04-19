import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LandingHero } from './landing-hero';
import { landingContent } from '@/lib/landing-content';

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

describe('LandingHero', () => {
  it('renders primary hero copy and CTA links', () => {
    render(
      <LandingHero
        title={landingContent.heroTitle}
        description={landingContent.heroDescription}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /building trust in global business/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/aml');
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute(
      'href',
      'mailto:hello@specus.org',
    );
  });
});
