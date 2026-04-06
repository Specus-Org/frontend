import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Proxy: GET single content by ID.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await fetchWithAuth(`/api/v1/admin/cms/contents/${id}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch content' },
      { status: 502 },
    );
  }
}

/**
 * Proxy: DELETE content by ID.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await fetchWithAuth(`/api/v1/admin/cms/contents/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete content' },
      { status: 502 },
    );
  }
}
