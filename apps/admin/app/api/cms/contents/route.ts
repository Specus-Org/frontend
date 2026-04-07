import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

/**
 * Proxy for admin content listing.
 * Forwards query params and auth token to the backend.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.toString();
  const path = `/api/v1/admin/cms/contents${query ? `?${query}` : ''}`;

  try {
    const response = await fetchWithAuth(path);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch contents' },
      { status: 502 },
    );
  }
}

/**
 * POST /api/cms/contents — Create a content item.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetchWithAuth('/api/v1/admin/cms/contents', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to create content' },
      { status: 502 },
    );
  }
}
