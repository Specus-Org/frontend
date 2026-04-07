import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Proxy: POST confirm an upload after the file has been uploaded to storage.
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await fetchWithAuth(
      `/api/v1/admin/cms/uploads/${id}/confirm`,
      { method: 'POST' },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Failed to confirm upload' },
      { status: 502 },
    );
  }
}
