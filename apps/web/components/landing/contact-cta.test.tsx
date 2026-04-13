import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ContactCta } from './contact-cta';
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

describe('ContactCta', () => {
  it('renders the closing CTA and contact destinations', () => {
    render(
      <ContactCta
        slogan={landingContent.slogan}
        contactLinks={landingContent.contactLinks}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: /ready to bring secure, compliant procurement into one trusted workflow/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /email specus/i })).toHaveAttribute(
      'href',
      'mailto:hello@specus.org',
    );
    expect(screen.getByRole('link', { name: /visit procurelens.org/i })).toHaveAttribute(
      'href',
      'https://procurelens.org',
    );
    expect(screen.getByRole('link', { name: /linkedin \(coming soon\)/i })).toBeInTheDocument();
  });
});
