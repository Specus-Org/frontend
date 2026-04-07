import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

function backendPath(id: string) {
  return `/api/v1/admin/cms/authors/${id}`;
}

/**
 * GET /api/cms/authors/[id] — Get a single author by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const response = await fetchWithAuth(backendPath(id));
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch author' },
      { status: 502 },
    );
  }
}

/**
 * PUT /api/cms/authors/[id] — Update an author.
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
      { message: 'Failed to update author' },
      { status: 502 },
    );
  }
}

/**
 * DELETE /api/cms/authors/[id] — Delete an author.
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
      { message: 'Failed to delete author' },
      { status: 502 },
    );
  }
}
