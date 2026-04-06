import { NextResponse, type NextRequest } from 'next/server';
import { getRefreshToken, setTokenCookies, clearTokenCookies } from '@/lib/auth';
import { fetchBackend } from '@/lib/api-client';

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

    const backendResponse = await fetchBackend('/api/v1/admin/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!backendResponse.ok) {
      const response = NextResponse.json(
        { message: 'Token refresh failed', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
      clearTokenCookies(response);
      return response;
    }

    const tokens = await backendResponse.json();
    const { access_token, refresh_token, id_token } = tokens;

    const response = NextResponse.json({ success: true }, { status: 200 });
    setTokenCookies(response, { access_token, refresh_token, id_token });

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
