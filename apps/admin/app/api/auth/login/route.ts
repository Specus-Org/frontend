import { NextResponse, type NextRequest } from 'next/server';
import { adminAuthLogin } from '@specus/api-client';
import { setTokenCookies, decodeJwtPayload } from '@/lib/auth';

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

    const { data, error, response } = await adminAuthLogin({
      body: { email, password },
    });

    if (error) {
      const statusMap: Record<string, number> = {
        INVALID_CREDENTIALS: 401,
        ACCOUNT_NOT_VERIFIED: 403,
        BAD_REQUEST: 400,
        AUTH_SERVICE_UNAVAILABLE: 503,
        AUTH_ERROR: 500,
        INTERNAL_ERROR: 500,
      };

      const authError = error as { message?: string; code?: string };
      const status = statusMap[authError.code ?? ''] ?? response.status;

      return NextResponse.json(
        {
          message: authError.message ?? 'Authentication failed',
          code: authError.code ?? 'AUTH_ERROR',
          raw: authError,
        },
        { status },
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 500 },
      );
    }

    const { access_token, refresh_token, id_token } = data;

    // Decode id_token to extract user info
    const idPayload = id_token ? decodeJwtPayload(id_token) : null;
    const user = {
      sub: idPayload?.sub ?? '',
      name: idPayload?.name ?? '',
      email: idPayload?.email ?? email,
    };

    const res = NextResponse.json({ user }, { status: 200 });
    setTokenCookies(res, { access_token, refresh_token, id_token: id_token ?? '' });

    return res;
  } catch {
    return NextResponse.json(
      { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
