import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@specus/auth';

async function clearSessionCookies() {
  const cookieStore = await cookies();
  const authCookieNames = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith('authjs.') || c.name.startsWith('__Secure-authjs.'))
    .map((c) => c.name);

  for (const name of authCookieNames) {
    cookieStore.delete(name);
  }
}

export async function POST(request: NextRequest) {
  // CSRF protection: verify the request Origin matches the app host
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && !origin.endsWith(host)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  // Get the session to retrieve the refresh token
  const session = await auth();
  const token = (session as unknown as { user?: Record<string, unknown> })?.user;
  const refreshToken = (token as Record<string, unknown>)?.refresh_token as string | undefined;

  // Revoke the refresh token via the backend
  if (refreshToken) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
    try {
      await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Best-effort — proceed with logout even if backend revocation fails
    }
  }

  // Clear all Auth.js session cookies
  await clearSessionCookies();

  // Redirect to home
  return NextResponse.redirect(new URL('/', request.nextUrl.origin));
}

// Reject non-POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
