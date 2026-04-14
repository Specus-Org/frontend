import { describe, expect, it } from 'vitest';
import type { EntitySanction } from '@specus/api-client';
import {
  buildDetailRows,
  buildSanctionRows,
  formatInlineValue,
  getSanctionLink,
} from './entity-detail-formatters';

describe('entity detail formatters', () => {
  it('formats arrays into comma-separated display text', () => {
    expect(formatInlineValue(['Indonesia', 'Singapore'])).toBe('Indonesia, Singapore');
  });

  it('formats type-field dates into long month strings', () => {
    expect(formatInlineValue('2026-04-03')).toBe('April 3, 2026');
    expect(formatInlineValue('2026-04-03T00:00:00Z')).toBe('April 3, 2026');
  });

  it('formats nested objects and omits blank values', () => {
    const rows = buildDetailRows({
      place_of_birth: {
        city: 'Jakarta',
        country: 'Indonesia',
        postal_code: '',
      },
      birth_date: '2026-04-03',
      aliases: ['A', { legal_name: 'Specus Holdings' }],
      notes: null,
    });

    expect(rows).toHaveLength(3);
    expect(rows[0]?.label).toBe('Place Of Birth');
    expect(rows[0]?.value.kind).toBe('group');
    expect(rows[1]).toMatchObject({
      label: 'Birth Date',
      value: { kind: 'text', text: 'April 3, 2026' },
    });
    expect(rows[2]).toMatchObject({
      label: 'Aliases',
      value: { kind: 'text', text: 'A, Legal Name: Specus Holdings' },
    });
  });

  it('builds sanction rows in the requested order and filters empty values', () => {
    const rows = buildSanctionRows({
      event_type: 'sanction',
      is_active: true,
      remarks: 'Listed for enforcement action',
      delisting_date: '',
      designation_date: '2024-10-01',
      program: 'OFAC SDN',
    } as EntitySanction);

    expect(rows).toEqual([
      { label: 'Program', value: 'OFAC SDN' },
      { label: 'Designation Date', value: 'October 1, 2024' },
      { label: 'Remarks', value: 'Listed for enforcement action' },
    ]);
  });

  it('prefers top-level sanction URLs and falls back to known property keys', () => {
    expect(
      getSanctionLink({
        event_type: 'sanction',
        is_active: true,
        list_url: 'https://example.com/top-level',
      } as EntitySanction),
    ).toBe('https://example.com/top-level');

    expect(
      getSanctionLink({
        event_type: 'sanction',
        is_active: true,
        properties: {
          source_link: 'https://example.com/source',
        },
      } as EntitySanction),
    ).toBe('https://example.com/source');
  });
});
