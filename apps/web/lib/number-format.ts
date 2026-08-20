const EXACT_COUNT_FORMATTER = new Intl.NumberFormat('en-US');

const COMPACT_COUNT_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const COMPACT_THRESHOLD = 1000;

/**
 * Formats a result count for display. Counts above the threshold are
 * abbreviated (12.5K) to keep the label short; smaller ones stay exact.
 */
export function formatRecordCount(value: number): string {
  if (!Number.isFinite(value)) return '0';

  const count = Math.max(0, Math.trunc(value));
  return count > COMPACT_THRESHOLD
    ? COMPACT_COUNT_FORMATTER.format(count)
    : EXACT_COUNT_FORMATTER.format(count);
}

/** Always-exact rendering, for tooltips and assistive text. */
export function formatExactCount(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return EXACT_COUNT_FORMATTER.format(Math.max(0, Math.trunc(value)));
}
