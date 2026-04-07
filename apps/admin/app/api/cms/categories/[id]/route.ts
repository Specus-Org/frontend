import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

function backendPath(id: string) {
  return `/api/v1/admin/cms/categories/${id}`;
}

/**
 * PUT /api/cms/categories/[id] — Update a category.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const response = await fetchWithAuth(backendPath(id), {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Failed to update category' },
      { status: 502 },
    );
  }
}

/**
 * DELETE /api/cms/categories/[id] — Delete a category.
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
      { message: 'Failed to delete category' },
      { status: 502 },
    );
  }
}
