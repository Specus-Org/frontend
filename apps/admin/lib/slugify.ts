/**
 * Regex for validating slugs: lowercase alphanumeric with hyphens.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Converts a human-readable string into a URL-friendly slug.
 *
 * Examples:
 *   slugify("Hello World")  => "hello-world"
 *   slugify("My  Blog Post!") => "my-blog-post"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
