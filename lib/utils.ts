import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/;

export function formatValue(value: unknown): string {
  const str = String(value);
  if (DATE_RE.test(str)) {
    const date = new Date(str);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
  return str;
}
