import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';
import type { CmsUploadUpdateRequest } from '@/types/uploads';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function pickUploadUpdateBody(body: unknown): CmsUploadUpdateRequest {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const source = body as Record<string, unknown>;
  const payload: CmsUploadUpdateRequest = {};

  if (typeof source.title === 'string' || source.title === null) {
    payload.title = source.title;
  }
  if (typeof source.description === 'string' || source.description === null) {
    payload.description = source.description;
  }
  if (typeof source.alt_text === 'string' || source.alt_text === null) {
    payload.alt_text = source.alt_text;
  }

  return payload;
}

/**
 * Proxy: PUT (update) upload metadata by ID.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = pickUploadUpdateBody(await request.json());
    const response = await fetchWithAuth(`/api/v1/admin/cms/uploads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return NextResponse.json(data ?? { message: 'Upstream error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Failed to update upload' }, { status: 502 });
  }
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
    return NextResponse.json({ message: 'Failed to delete upload' }, { status: 502 });
  }
}
