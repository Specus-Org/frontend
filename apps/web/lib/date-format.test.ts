import { describe, expect, it } from 'vitest';
import { formatDisplayDate, tryFormatDisplayDate } from './date-format';

describe('date formatting', () => {
  it('formats date-only values into long month dates', () => {
    expect(formatDisplayDate('2023-06-28')).toBe('June 28, 2023');
  });

  it('formats ISO datetimes into long month dates', () => {
    expect(formatDisplayDate('2023-06-28T00:00:00Z')).toBe('June 28, 2023');
  });

  it('returns null for non-date text when probing', () => {
    expect(tryFormatDisplayDate('not-a-date')).toBeNull();
  });

  it('falls back to the original text when formatting non-date values', () => {
    expect(formatDisplayDate('not-a-date')).toBe('not-a-date');
  });
});
