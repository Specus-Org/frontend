import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@specus/auth';

// Cache the OIDC well-known configuration at module scope
let cachedOidcConfig: {
  end_session_endpoint?: string;
  revocation_endpoint?: string;
} | null = null;

async function getOidcConfig() {
  if (cachedOidcConfig) return cachedOidcConfig;

  const issuer = process.env.AUTH_AUTHENTIK_ISSUER;
  if (!issuer) return null;

  try {
    const res = await fetch(`${issuer}/.well-known/openid-configuration`);
    if (!res.ok) return null;
    cachedOidcConfig = await res.json();
    return cachedOidcConfig;
  } catch {
    return null;
  }
}

async function clearSessionCookies() {
  const cookieStore = await cookies();
  // Auth.js uses these cookie names (with possible chunked suffixes)
  const authCookieNames = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith('authjs.') || c.name.startsWith('__Secure-authjs.'))
    .map((c) => c.name);

  for (const name of authCookieNames) {
    cookieStore.delete(name);
  }
}

async function revokeToken(revocationEndpoint: string, refreshToken: string) {
  try {
    await fetch(revocationEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.AUTH_AUTHENTIK_ID!,
        client_secret: process.env.AUTH_AUTHENTIK_SECRET!,
        token: refreshToken,
        token_type_hint: 'refresh_token',
      }),
    });
  } catch {
    // Best-effort revocation — proceed with logout even if revocation fails
  }
}

export async function POST(request: NextRequest) {
  // CSRF protection: verify the request Origin matches the app host
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && !origin.endsWith(host)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  // Get the session to retrieve tokens
  const session = await auth();

  // Clear all Auth.js session cookies
  await clearSessionCookies();

  // Build the OIDC logout redirect
  const oidcConfig = await getOidcConfig();
  const endSessionEndpoint = oidcConfig?.end_session_endpoint;

  // Revoke the refresh token if possible
  const token = (session as unknown as { user?: Record<string, unknown> })?.user;
  const refreshToken = (token as Record<string, unknown>)?.refresh_token as string | undefined;
  const idToken = (token as Record<string, unknown>)?.id_token as string | undefined;

  if (oidcConfig?.revocation_endpoint && refreshToken) {
    await revokeToken(oidcConfig.revocation_endpoint, refreshToken);
  }

  // Redirect to Authentik's end_session_endpoint if available
  if (endSessionEndpoint) {
    const logoutUrl = new URL(endSessionEndpoint);
    if (idToken) {
      logoutUrl.searchParams.set('id_token_hint', idToken);
    }
    // Hardcoded post-logout redirect — never derived from user input
    const postLogoutUri = new URL('/', request.nextUrl.origin).toString();
    logoutUrl.searchParams.set('post_logout_redirect_uri', postLogoutUri);

    return NextResponse.redirect(logoutUrl);
  }

  // Fallback: local-only sign-out, redirect to home
  return NextResponse.redirect(new URL('/', request.nextUrl.origin));
}

// Reject non-POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
