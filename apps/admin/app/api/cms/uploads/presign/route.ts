import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

/**
 * Proxy: POST request a presigned upload URL.
 * Body: { filename, content_type, upload_type, size_bytes }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetchWithAuth('/api/v1/admin/cms/uploads/presign', {
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
      { message: 'Failed to request presigned URL' },
      { status: 502 },
    );
  }
}
