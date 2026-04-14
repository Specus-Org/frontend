const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T/;

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function tryFormatDisplayDate(value: string): string | null {
  const normalized = value.trim();
  if (normalized === '') return null;

  const dateOnlyMatch = normalized.match(DATE_ONLY_PATTERN);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

    if (
      date.getUTCFullYear() === Number(year) &&
      date.getUTCMonth() === Number(month) - 1 &&
      date.getUTCDate() === Number(day)
    ) {
      return DISPLAY_DATE_FORMATTER.format(date);
    }

    return null;
  }

  if (ISO_DATETIME_PATTERN.test(normalized)) {
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return DISPLAY_DATE_FORMATTER.format(parsed);
    }
  }

  return null;
}

export function formatDisplayDate(value: string): string {
  return tryFormatDisplayDate(value) ?? value;
}
