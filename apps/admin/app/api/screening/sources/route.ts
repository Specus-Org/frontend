import { NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api-client';

/**
 * Proxy for screening sources listing.
 *   GET /api/screening/sources → backend /api/v1/screening/sources
 */
export async function GET() {
  try {
    const response = await fetchBackend('/api/v1/screening/sources');
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { sources: [], message: 'Cannot reach backend' },
      { status: 502 },
    );
  }
}
