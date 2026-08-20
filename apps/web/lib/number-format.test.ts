import { describe, expect, it } from 'vitest';
import { formatExactCount, formatRecordCount } from './number-format';

describe('formatRecordCount', () => {
  it('keeps counts at or below the threshold exact', () => {
    expect(formatRecordCount(0)).toBe('0');
    expect(formatRecordCount(20)).toBe('20');
    expect(formatRecordCount(999)).toBe('999');
    expect(formatRecordCount(1000)).toBe('1,000');
  });

  it('abbreviates counts above the threshold', () => {
    expect(formatRecordCount(1001)).toBe('1K');
    expect(formatRecordCount(1250)).toBe('1.3K');
    expect(formatRecordCount(12500)).toBe('12.5K');
    expect(formatRecordCount(1000000)).toBe('1M');
  });

  it('guards against negative and non-finite input', () => {
    expect(formatRecordCount(-5)).toBe('0');
    expect(formatRecordCount(Number.NaN)).toBe('0');
  });
});

describe('formatExactCount', () => {
  it('always renders the full number with separators', () => {
    expect(formatExactCount(999)).toBe('999');
    expect(formatExactCount(12500)).toBe('12,500');
  });
});
