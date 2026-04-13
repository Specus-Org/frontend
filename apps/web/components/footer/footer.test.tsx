import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CmsFooterGroupWithItems } from '@specus/api-client';
import Footer from '../footer';

const { publicGetFooter } = vi.hoisted(() => ({
  publicGetFooter: vi.fn(),
}));

vi.mock('@specus/api-client', () => ({
  publicGetFooter,
}));

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

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('Footer', () => {
  beforeEach(() => {
    publicGetFooter.mockReset();
  });

  it('renders CMS footer groups after Products when data is available', async () => {
    const groups: CmsFooterGroupWithItems[] = [
      {
        id: 'company',
        name: 'Company',
        slug: 'company',
        sort_order: 1,
        created_at: '2026-04-11T00:00:00Z',
        updated_at: '2026-04-11T00:00:00Z',
        items: [{ id: 'about', title: 'About', slug: 'about', url_path: '/about', content_type: 'static_page', page_type: null }],
      },
      {
        id: 'empty',
        name: 'Empty',
        slug: 'empty',
        sort_order: 2,
        created_at: '2026-04-11T00:00:00Z',
        updated_at: '2026-04-11T00:00:00Z',
        items: [],
      },
    ];

    publicGetFooter.mockResolvedValue({ data: { groups } });

    render(await Footer());

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Specus',
      'Products',
      'Company',
    ]);
    expect(screen.queryByRole('heading', { name: 'Empty' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('falls back to the static footer when the footer request fails', async () => {
    publicGetFooter.mockRejectedValue(new Error('boom'));

    render(await Footer());

    expect(screen.getByRole('img', { name: 'Specus logo' })).toHaveAttribute('src', '/ic_logo.png');
    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Company' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Insights' })).toBeInTheDocument();
  });
});
