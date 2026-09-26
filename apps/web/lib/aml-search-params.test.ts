import { describe, expect, it } from 'vitest';
import {
  buildAmlSearchUrl,
  EMPTY_AML_SEARCH_FILTERS,
  hasActiveFilters,
  parseAmlSearchFilters,
} from './aml-search-params';

describe('parseAmlSearchFilters', () => {
  it('keeps known topics only, deduplicated and in canonical order', () => {
    const params = new URLSearchParams(
      'topics=case_law&topics=bogus&topics=sanction&topics=case_law&country=ID',
    );

    expect(parseAmlSearchFilters(params)).toEqual({
      topics: ['sanction', 'case_law'],
      country: 'ID',
    });
  });

  it('treats a missing or blank country as no filter', () => {
    expect(parseAmlSearchFilters(new URLSearchParams('q=putin')).country).toBeNull();
    expect(parseAmlSearchFilters(new URLSearchParams('country=%20')).country).toBeNull();
  });
});

describe('buildAmlSearchUrl', () => {
  it('encodes the name, repeated topics and the country', () => {
    expect(buildAmlSearchUrl('Jane Doe', { topics: ['sanction', 'pep'], country: 'RU' })).toBe(
      '/aml/search?q=Jane+Doe&topics=sanction&topics=pep&country=RU',
    );
  });

  it('leaves out filters that are not set', () => {
    expect(buildAmlSearchUrl('acme', { topics: [], country: null })).toBe('/aml/search?q=acme');
  });

  it('round-trips through parseAmlSearchFilters', () => {
    const url = buildAmlSearchUrl('acme', { topics: ['pep', 'blacklist'], country: 'BD' });
    const params = new URLSearchParams(url.split('?')[1]);

    expect(params.get('q')).toBe('acme');
    expect(parseAmlSearchFilters(params)).toEqual({ topics: ['pep', 'blacklist'], country: 'BD' });
  });
});

describe('hasActiveFilters', () => {
  it('is false only when no topic or country is set', () => {
    expect(hasActiveFilters(EMPTY_AML_SEARCH_FILTERS)).toBe(false);
    expect(hasActiveFilters({ topics: ['pep'], country: null })).toBe(true);
    expect(hasActiveFilters({ topics: [], country: 'ID' })).toBe(true);
  });
});
