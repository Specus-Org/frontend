import { NextResponse, type NextRequest } from 'next/server';
import { fetchBackend } from '@/lib/api-client';

/**
 * Proxy for backend health endpoints.
 * Query param `check` selects liveness or readiness.
 *   GET /api/health?check=live  → backend /health/live
 *   GET /api/health?check=ready → backend /health/ready
 */
export async function GET(request: NextRequest) {
  const check = request.nextUrl.searchParams.get('check') ?? 'live';
  const path = check === 'ready' ? '/health/ready' : '/health/live';

  try {
    const response = await fetchBackend(path);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { status: 'unreachable', message: 'Cannot reach backend' },
      { status: 502 },
    );
  }
}
