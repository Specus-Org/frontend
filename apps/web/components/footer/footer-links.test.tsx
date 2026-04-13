import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import FooterLinks from './footer-links';
import type { FooterLinkGroup } from './footer-link-groups';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        props.onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

describe('FooterLinks', () => {
  it('renders Products first, then CMS groups in API order', () => {
    const groups: FooterLinkGroup[] = [
      {
        id: 'company',
        name: 'Company',
        items: [
          { id: 'about', title: 'About', urlPath: '/about' },
          { id: 'team', title: 'Team', urlPath: '/about/team' },
        ],
      },
      {
        id: 'resources',
        name: 'Resources',
        items: [{ id: 'blog', title: 'Blog', urlPath: '/blog' }],
      },
    ];

    render(<FooterLinks groups={groups} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Products',
      'Company',
      'Resources',
    ]);

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    );
    expect(screen.getByRole('link', { name: 'Team' })).toHaveAttribute(
      'href',
      '/about/team',
    );
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      '/blog',
    );
  });

  it('keeps the existing Products smooth-scroll behavior', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', {
      value: scrollTo,
      writable: true,
    });

    render(<FooterLinks groups={[]} />);

    fireEvent.click(screen.getByRole('link', { name: 'Insights' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
