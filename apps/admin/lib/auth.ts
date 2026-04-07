import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cookie names
const ACCESS_TOKEN_COOKIE = 'specus_access_token';
const REFRESH_TOKEN_COOKIE = 'specus_refresh_token';
const ID_TOKEN_COOKIE = 'specus_id_token';

// Cookie max ages
const ACCESS_TOKEN_MAX_AGE = 900; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

interface Tokens {
  access_token: string;
  refresh_token: string;
  id_token: string;
}

/**
 * Set httpOnly, secure, SameSite=Lax token cookies on a NextResponse.
 */
export function setTokenCookies(response: NextResponse, tokens: Tokens): void {
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  response.cookies.set(ID_TOKEN_COOKIE, tokens.id_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

/**
 * Read access_token from request cookies (for use in middleware/API routes).
 */
export function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * Read refresh_token from request cookies (for use in middleware/API routes).
 */
export function getRefreshToken(request: NextRequest): string | undefined {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
}

/**
 * Read id_token from request cookies (for use in middleware/API routes).
 */
export function getIdToken(request: NextRequest): string | undefined {
  return request.cookies.get(ID_TOKEN_COOKIE)?.value;
}

/**
 * Clear all token cookies on a NextResponse.
 */
export function clearTokenCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set(ID_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Read access_token from the server-side cookie store (for use in Server Components / Route Handlers).
 */
export async function getAccessTokenFromCookieStore(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * Read refresh_token from the server-side cookie store.
 */
export async function getRefreshTokenFromCookieStore(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

/**
 * Read id_token from the server-side cookie store.
 */
export async function getIdTokenFromCookieStore(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ID_TOKEN_COOKIE)?.value;
}

/**
 * Decode a JWT payload without verification.
 * The backend already verifies the token -- we just need to read claims.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;

    // Base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);

    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired based on its `exp` claim.
 * Returns true if the token is expired or unreadable.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;

  // Add a small buffer (30 seconds) to account for clock skew
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowInSeconds + 30;
}

export {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
};

export type { Tokens };
