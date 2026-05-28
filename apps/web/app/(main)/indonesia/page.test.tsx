import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import IndonesiaPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('IndonesiaPage', () => {
  const TEST_URL = 'https://powerbi.example.test/view?r=xyz';
  const TITLE = 'Indonesia Procurement Analysis SPECUS Dashboard';

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_INDONESIA_DASHBOARD_URL', TEST_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders an iframe whose src matches the configured env var', () => {
    render(<IndonesiaPage />);

    const iframe = screen.getByTitle(TITLE);
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe).toHaveAttribute('src', TEST_URL);
  });

  it('sets security attributes on the iframe', () => {
    render(<IndonesiaPage />);

    const iframe = screen.getByTitle(TITLE);
    expect(iframe).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
  });

  it('lets the dashboard define the document height without horizontal scrolling', () => {
    render(<IndonesiaPage />);

    const iframe = screen.getByTitle(TITLE);
    expect(iframe.parentElement).toHaveClass('overflow-x-hidden');
    expect(iframe.parentElement).not.toHaveClass('overflow-hidden');
    expect(iframe).toHaveClass('block', 'min-h-[2200px]', 'w-full', 'border-0');
    expect(iframe).not.toHaveClass('min-w-[960px]');
  });

  it('triggers notFound when the dashboard URL env var is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_INDONESIA_DASHBOARD_URL', '');
    const { notFound } = await import('next/navigation');

    expect(() => render(<IndonesiaPage />)).toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});
