import { NextResponse, type NextRequest } from 'next/server';
import { setTokenCookies, decodeJwtPayload } from '@/lib/auth';
import { fetchBackend } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required', code: 'BAD_REQUEST' },
        { status: 400 },
      );
    }

    const backendResponse = await fetchBackend('/api/v1/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({
        message: 'Authentication failed',
        code: 'AUTH_ERROR',
      }));

      const statusMap: Record<string, number> = {
        INVALID_CREDENTIALS: 401,
        ACCOUNT_NOT_VERIFIED: 403,
        BAD_REQUEST: 400,
        AUTH_SERVICE_UNAVAILABLE: 503,
        AUTH_ERROR: 500,
        INTERNAL_ERROR: 500,
      };

      const status = statusMap[error.code] ?? backendResponse.status;

      return NextResponse.json(
        { message: error.message, code: error.code },
        { status },
      );
    }

    const tokens = await backendResponse.json();
    const { access_token, refresh_token, id_token } = tokens;

    // Decode id_token to extract user info
    const idPayload = decodeJwtPayload(id_token);
    const user = {
      sub: idPayload?.sub ?? '',
      name: idPayload?.name ?? '',
      email: idPayload?.email ?? email,
    };

    const response = NextResponse.json({ user }, { status: 200 });

    setTokenCookies(response, { access_token, refresh_token, id_token });

    return response;
  } catch {
    return NextResponse.json(
      { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
