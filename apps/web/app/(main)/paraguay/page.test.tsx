import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ParaguayPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('ParaguayPage', () => {
  const TEST_URL = 'https://superset.example.test/dashboard/p/abc/?standalone=2';

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL', TEST_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders an iframe whose src matches the configured env var', () => {
    render(<ParaguayPage />);

    const iframe = screen.getByTitle('Paraguay Procurement Analysis SPECUS Dashboard');
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe).toHaveAttribute('src', TEST_URL);
  });

  it('sets security attributes on the iframe', () => {
    render(<ParaguayPage />);

    const iframe = screen.getByTitle('Paraguay Procurement Analysis SPECUS Dashboard');
    expect(iframe).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
  });

  it('lets the dashboard define the document height instead of clipping it', () => {
    render(<ParaguayPage />);

    const iframe = screen.getByTitle('Paraguay Procurement Analysis SPECUS Dashboard');
    expect(iframe.parentElement).toHaveClass('overflow-x-hidden');
    expect(iframe.parentElement).not.toHaveClass('overflow-hidden');
    expect(iframe).toHaveClass('block', 'min-h-[2200px]', 'w-full', 'border-0');
    expect(iframe).not.toHaveClass('min-w-[960px]');
  });

  it('triggers notFound when the dashboard URL env var is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL', '');
    const { notFound } = await import('next/navigation');

    expect(() => render(<ParaguayPage />)).toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});
