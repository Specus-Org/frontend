import { cookies } from 'next/headers';
import {
  getAccessTokenFromCookieStore,
  getRefreshTokenFromCookieStore,
  isTokenExpired,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from './auth';

/**
 * Base URL for the backend API.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Attempt to refresh the access token using the refresh token.
 * Calls the backend directly (not via the Next.js API route) and
 * updates cookies via the `cookies()` API.
 *
 * Returns the new access token on success, or null on failure.
 */
async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = await getRefreshTokenFromCookieStore();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const { access_token, refresh_token, id_token } = data as {
      access_token: string;
      refresh_token: string;
      id_token?: string;
    };

    // Update cookies on the outgoing response (works in Route Handlers)
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieStore = await cookies();

    cookieStore.set(ACCESS_TOKEN_COOKIE, access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    cookieStore.set(ID_TOKEN_COOKIE, id_token ?? '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return access_token;
  } catch {
    return null;
  }
}

/**
 * Authenticated fetch wrapper for server-side API calls (API routes, Server Components).
 *
 * Reads the access_token from the cookie store and attaches it as a Bearer token.
 * If the token is expired, automatically refreshes it using the refresh_token
 * before making the request.
 *
 * For client-side calls, the browser automatically sends cookies, so use the
 * Next.js API routes as a proxy instead.
 */
export async function fetchWithAuth(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  let accessToken = await getAccessTokenFromCookieStore();

  // Auto-refresh if token is missing or expired
  if (!accessToken || isTokenExpired(accessToken)) {
    const refreshedToken = await tryRefreshToken();
    if (refreshedToken) {
      accessToken = refreshedToken;
    }
  }

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

/**
 * Plain fetch to the backend without auth (for public endpoints like health, screening).
 */
export function fetchBackend(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, options);
}

export { API_BASE_URL };
