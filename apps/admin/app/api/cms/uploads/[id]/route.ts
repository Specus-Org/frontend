import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Proxy: DELETE an upload by ID.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await fetchWithAuth(`/api/v1/admin/cms/uploads/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete upload' },
      { status: 502 },
    );
  }
}
