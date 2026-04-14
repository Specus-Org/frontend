import type { EntitySanction } from '@specus/api-client';
import { tryFormatDisplayDate } from '@/lib/date-format';

export interface DetailTextValue {
  kind: 'text';
  text: string;
}

export interface DetailGroupValue {
  kind: 'group';
  rows: DetailFieldRow[];
}

export type DetailFieldValue = DetailTextValue | DetailGroupValue;

export interface DetailFieldRow {
  key: string;
  label: string;
  value: DetailFieldValue;
}

export interface SanctionFieldRow {
  label: 'Program' | 'Designation Date' | 'Delisted Date' | 'Remarks';
  value: string;
}

const SANCTION_URL_PROPERTY_CANDIDATES = [
  'source_link',
  'source_url',
  'url',
  'link',
  'list_url',
] as const;
export function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function toDisplayText(value: unknown): string | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized === '' ? null : normalized;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return null;
}

function formatDateValue(value: string): string | null {
  return tryFormatDisplayDate(value);
}

function toDetailDisplayText(value: unknown): string | null {
  const displayText = toDisplayText(value);
  if (!displayText) return null;

  if (typeof value === 'string') {
    return formatDateValue(displayText) ?? displayText;
  }

  return displayText;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

function isExternalUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

export function formatInlineValue(value: unknown): string | null {
  const displayText = toDetailDisplayText(value);
  if (displayText) return displayText;

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => formatInlineValue(item))
      .filter((item): item is string => item != null && item.trim() !== '');

    return parts.length > 0 ? parts.join(', ') : null;
  }

  if (isPlainObject(value)) {
    const parts = Object.entries(value)
      .map(([key, nestedValue]) => {
        const nestedText = formatInlineValue(nestedValue);
        return nestedText ? `${formatLabel(key)}: ${nestedText}` : null;
      })
      .filter((item): item is string => item != null);

    return parts.length > 0 ? parts.join(', ') : null;
  }

  return null;
}

export function formatDetailValue(value: unknown): DetailFieldValue | null {
  const displayText = toDetailDisplayText(value);
  if (displayText) {
    return { kind: 'text', text: displayText };
  }

  if (Array.isArray(value)) {
    const inlineText = formatInlineValue(value);
    return inlineText ? { kind: 'text', text: inlineText } : null;
  }

  if (isPlainObject(value)) {
    const rows = buildDetailRows(value);
    return rows.length > 0 ? { kind: 'group', rows } : null;
  }

  return null;
}

export function buildDetailRows(fields?: Record<string, unknown>): DetailFieldRow[] {
  return Object.entries(fields ?? {})
    .map(([key, value]) => {
      const formattedValue = formatDetailValue(value);

      if (!formattedValue) return null;

      return {
        key,
        label: formatLabel(key),
        value: formattedValue,
      } satisfies DetailFieldRow;
    })
    .filter((row): row is DetailFieldRow => row != null);
}

function toSanctionRow(label: SanctionFieldRow['label'], value: unknown): SanctionFieldRow | null {
  const text = toDisplayText(value);
  return text ? { label, value: formatDateValue(text) ?? text } : null;
}

export function buildSanctionRows(sanction: EntitySanction): SanctionFieldRow[] {
  return [
    toSanctionRow('Program', sanction.program),
    toSanctionRow('Designation Date', sanction.designation_date),
    toSanctionRow('Delisted Date', sanction.delisting_date),
    toSanctionRow('Remarks', sanction.remarks),
  ].filter((row): row is SanctionFieldRow => row != null);
}

export function getSanctionLink(sanction: EntitySanction): string | null {
  if (isExternalUrl(sanction.list_url)) return sanction.list_url;

  const properties = sanction.properties;
  if (!isPlainObject(properties)) return null;

  for (const candidate of SANCTION_URL_PROPERTY_CANDIDATES) {
    const value = properties[candidate];
    if (isExternalUrl(value)) return value;
  }

  return null;
}
