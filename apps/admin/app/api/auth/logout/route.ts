import { NextResponse, type NextRequest } from 'next/server';
import { getRefreshToken, clearTokenCookies } from '@/lib/auth';
import { fetchBackend } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken(request);

    // Call backend to invalidate the refresh token (best-effort)
    if (refreshToken) {
      await fetchBackend('/api/v1/admin/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
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
