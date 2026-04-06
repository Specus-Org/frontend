import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/api-client';

const BACKEND_PATH = '/api/v1/admin/cms/categories';

/**
 * GET /api/cms/categories — List all categories.
 */
export async function GET() {
  try {
    const response = await fetchWithAuth(BACKEND_PATH);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 502 },
    );
  }
}

/**
 * POST /api/cms/categories — Create a category.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetchWithAuth(BACKEND_PATH, {
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
      { message: 'Failed to create category' },
      { status: 502 },
    );
  }
}
