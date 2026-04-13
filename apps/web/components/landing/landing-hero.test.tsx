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
        announcement={landingContent.announcement}
        title={landingContent.heroTitle}
        description={landingContent.heroDescription}
        slogan={landingContent.slogan}
        metrics={landingContent.heroMetrics}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /build ethical procurement with intelligence you can verify/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start a screening/i })).toHaveAttribute(
      'href',
      '/aml',
    );
    expect(screen.getByRole('link', { name: /contact specus/i })).toHaveAttribute(
      'href',
      'mailto:hello@specus.org',
    );
  });

  it('renders all proof metrics', () => {
    render(
      <LandingHero
        announcement={landingContent.announcement}
        title={landingContent.heroTitle}
        description={landingContent.heroDescription}
        slogan={landingContent.slogan}
        metrics={landingContent.heroMetrics}
      />,
    );

    for (const metric of landingContent.heroMetrics) {
      expect(screen.getByText(metric.value)).toBeInTheDocument();
      expect(screen.getByText(metric.label)).toBeInTheDocument();
    }
  });
});
