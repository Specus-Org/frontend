import { type NextRequest, NextResponse } from 'next/server';
import {
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  setTokenCookies,
  clearTokenCookies,
} from '@/lib/auth';

/**
 * Middleware that protects all routes except public ones.
 *
 * - If no access_token cookie: redirect to /login
 * - If access_token is expired but refresh_token exists: attempt auto-refresh
 * - If refresh fails or no refresh_token: redirect to /login
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = getAccessToken(request);
  const refreshToken = getRefreshToken(request);

  // No tokens at all — redirect to login
  if (!accessToken) {
    return redirectToLogin(request, pathname);
  }

  // Access token is still valid — proceed
  if (!isTokenExpired(accessToken)) {
    return NextResponse.next();
  }

  // Access token expired — try to refresh
  if (refreshToken) {
    try {
      const refreshUrl = new URL('/api/auth/refresh', request.url);
      const refreshResponse = await fetch(refreshUrl.toString(), {
        method: 'POST',
        headers: {
          Cookie: request.headers.get('cookie') ?? '',
        },
      });

      if (refreshResponse.ok) {
        // Refresh succeeded — let the request continue, but copy the new cookies
        const response = NextResponse.next();

        // Forward Set-Cookie headers from the refresh response
        const setCookieHeaders = refreshResponse.headers.getSetCookie();
        for (const cookie of setCookieHeaders) {
          response.headers.append('Set-Cookie', cookie);
        }

        return response;
      }
    } catch {
      // Refresh request failed — fall through to redirect
    }
  }

  // Refresh failed or no refresh token — redirect to login
  const response = redirectToLogin(request, pathname);
  clearTokenCookies(response);
  return response;
}

function redirectToLogin(request: NextRequest, callbackUrl: string): NextResponse {
  const loginUrl = new URL('/login', request.url);
  if (callbackUrl && callbackUrl !== '/login') {
    loginUrl.searchParams.set('callbackUrl', callbackUrl);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - /login (auth page)
     * - /api/auth/* (auth API routes)
     * - /_next/* (Next.js internals)
     * - /favicon* (favicon files)
     * - Static files with extensions (e.g. .png, .ico, .svg)
     */
    '/((?!login|api/auth|_next|favicon|.*\\.[\\w]+$).*)',
  ],
};
