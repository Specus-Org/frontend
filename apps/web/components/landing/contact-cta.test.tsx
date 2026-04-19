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
  it('renders the closing CTA with contact and get started links', () => {
    render(
      <ContactCta
        announcement={landingContent.announcement}
        contactLinks={landingContent.contactLinks}
      />,
    );

    expect(
      screen.getByText(/trusted procurement intelligence for secure, compliant vendor decisions/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute(
      'href',
      'mailto:hello@specus.org',
    );
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/aml');
  });
});
