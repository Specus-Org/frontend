import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

function backendPath(id: string) {
  return `/api/v1/admin/cms/page-types/${id}`;
}

/**
 * DELETE /api/cms/page-types/[id] — Delete a page type.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const response = await fetchWithAuth(backendPath(id), {
      method: 'DELETE',
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete page type' },
      { status: 502 },
    );
  }
}
