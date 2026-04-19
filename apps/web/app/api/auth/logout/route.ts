import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAuthSecret } from '@/lib/api';

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
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
  if (new URL(origin).host !== host) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  const token = await getToken({ req: request, secret: getAuthSecret() });
  const refreshToken = token?.refresh_token as string | undefined;

  if (refreshToken) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
    try {
      await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Best-effort — proceed with logout even if backend revocation fails
    }
  }

  await clearSessionCookies();

  return NextResponse.redirect(new URL('/', request.url));
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
