import type { ScreeningTopic } from '@specus/api-client';

export type ScreeningTopicCode = ScreeningTopic['code'];

export interface AmlSearchFilters {
  topics: ScreeningTopicCode[];
  /** ISO 3166-1 alpha-2 code, as returned by the countries endpoint. */
  country: string | null;
}

export const EMPTY_AML_SEARCH_FILTERS: AmlSearchFilters = { topics: [], country: null };

/** Canonical topic order, matching the order the topics endpoint lists them in. */
export const TOPIC_CODES: readonly ScreeningTopicCode[] = [
  'sanction',
  'pep',
  'blacklist',
  'case_law',
];

/** Used until the topics endpoint responds, or if it fails. */
export const TOPIC_FALLBACK_LABELS: Record<ScreeningTopicCode, string> = {
  sanction: 'Sanction',
  pep: 'PEP',
  blacklist: 'Blacklist',
  case_law: 'Case Law',
};

interface SearchParamsReader {
  get(name: string): string | null;
  getAll(name: string): string[];
}

export function hasActiveFilters(filters: AmlSearchFilters): boolean {
  return filters.topics.length > 0 || filters.country !== null;
}

/** Keeps known topics only, deduplicated and in canonical order. */
export function normalizeTopics(topics: Iterable<string>): ScreeningTopicCode[] {
  const selected = new Set(topics);
  return TOPIC_CODES.filter((code) => selected.has(code));
}

export function parseAmlSearchFilters(params: SearchParamsReader): AmlSearchFilters {
  return {
    topics: normalizeTopics(params.getAll('topics')),
    country: params.get('country')?.trim() || null,
  };
}

export function buildAmlSearchUrl(query: string, filters: AmlSearchFilters): string {
  const params = new URLSearchParams({ q: query });
  for (const topic of filters.topics) params.append('topics', topic);
  if (filters.country) params.set('country', filters.country);

  return `/aml/search?${params}`;
}
