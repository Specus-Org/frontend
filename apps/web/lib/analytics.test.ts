import { describe, expect, it, vi } from 'vitest';
import { analyticsEvent, trackEvent } from './analytics';

describe('analyticsEvent', () => {
  it('builds Umami data attributes and drops empty values', () => {
    expect(
      analyticsEvent('resource_filter_click', {
        type: 'document',
        index: 2,
        active: true,
        ignored: null,
      }),
    ).toEqual({
      'data-umami-event': 'resource_filter_click',
      'data-umami-event-type': 'document',
      'data-umami-event-index': '2',
      'data-umami-event-active': 'true',
    });
  });
});

describe('trackEvent', () => {
  it('delegates to window.umami when available', () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent('aml_search_submit', { source: 'test' });

    expect(track).toHaveBeenCalledWith('aml_search_submit', { source: 'test' });

    delete window.umami;
  });
});
