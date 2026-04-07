import { NextResponse, type NextRequest } from 'next/server';
import { adminAuthRefresh } from '@specus/api-client';
import { getRefreshToken, setTokenCookies, clearTokenCookies } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken(request);

    if (!refreshToken) {
      const response = NextResponse.json(
        { message: 'No refresh token', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
      clearTokenCookies(response);
      return response;
    }

    const { data, error } = await adminAuthRefresh({
      body: { refresh_token: refreshToken },
    });

    if (error || !data) {
      const response = NextResponse.json(
        { message: 'Token refresh failed', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
      clearTokenCookies(response);
      return response;
    }

    const { access_token, refresh_token, id_token } = data;

    const response = NextResponse.json({ success: true }, { status: 200 });
    setTokenCookies(response, { access_token, refresh_token, id_token: id_token ?? '' });

    return response;
  } catch {
    const response = NextResponse.json(
      { message: 'Token refresh failed', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
    clearTokenCookies(response);
    return response;
  }
}
