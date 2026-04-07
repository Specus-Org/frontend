import { NextResponse, type NextRequest } from 'next/server';
import { adminAuthLogout } from '@specus/api-client';
import { getRefreshToken, clearTokenCookies } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken(request);

    // Call backend to invalidate the refresh token (best-effort)
    if (refreshToken) {
      await adminAuthLogout({
        body: { refresh_token: refreshToken },
      }).catch(() => {
        // Ignore backend errors — we clear cookies regardless
      });
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    clearTokenCookies(response);
    return response;
  } catch {
    const response = NextResponse.json({ success: true }, { status: 200 });
    clearTokenCookies(response);
    return response;
  }
}
