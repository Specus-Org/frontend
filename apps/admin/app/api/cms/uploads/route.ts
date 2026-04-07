import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

/**
 * Proxy: GET list of uploads.
 * Forwards query params and auth token to the backend.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.toString();
  const path = `/api/v1/admin/cms/uploads${query ? `?${query}` : ''}`;

  try {
    const response = await fetchWithAuth(path);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch uploads' },
      { status: 502 },
    );
  }
}
