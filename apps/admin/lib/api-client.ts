import { getAccessTokenFromCookieStore } from './auth';

/**
 * Base URL for the backend API.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Authenticated fetch wrapper for server-side API calls (API routes, Server Components).
 *
 * Reads the access_token from the cookie store and attaches it as a Bearer token.
 * For client-side calls, the browser automatically sends cookies, so use the
 * Next.js API routes as a proxy instead.
 */
export async function fetchWithAuth(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const accessToken = await getAccessTokenFromCookieStore();

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

export { API_BASE_URL };
