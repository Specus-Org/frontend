import { NextResponse, type NextRequest } from 'next/server';
import {
  adminDeleteFooterGroup,
  adminUpdateFooterGroup,
  type CmsUpdateFooterGroupRequest,
} from '@specus/api-client';
import { getAccessTokenFromCookieStore } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getAuthHeaders() {
  const accessToken = await getAccessTokenFromCookieStore();
  if (!accessToken) return null;

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as CmsUpdateFooterGroupRequest;
    const { data, error, response } = await adminUpdateFooterGroup({
      body,
      headers,
      path: { id },
    });

    if (error || !data) {
      return NextResponse.json(
        error ?? { message: 'Failed to update footer group' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Failed to update footer group' },
      { status: 502 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const { error, response } = await adminDeleteFooterGroup({
      headers,
      path: { id },
    });

    if (error) {
      return NextResponse.json(error, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete footer group' },
      { status: 502 },
    );
  }
}
