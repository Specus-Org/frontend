import { NextResponse, type NextRequest } from 'next/server';
import {
  adminCreateFooterGroup,
  adminListFooterGroups,
  type CmsCreateFooterGroupRequest,
} from '@specus/api-client';
import { getAccessTokenFromCookieStore } from '@/lib/auth';

async function getAuthHeaders() {
  const accessToken = await getAccessTokenFromCookieStore();
  if (!accessToken) return null;

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function GET() {
  try {
    const headers = await getAuthHeaders();

    if (!headers) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error, response } = await adminListFooterGroups({
      headers,
    });

    if (error || !data) {
      return NextResponse.json(
        error ?? { message: 'Failed to fetch footer groups' },
        { status: response.status },
      );
    }

    return NextResponse.json({
      ...data,
      integration_ready: true,
    });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch footer groups' }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders();

    if (!headers) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as CmsCreateFooterGroupRequest;
    const { data, error, response } = await adminCreateFooterGroup({
      body,
      headers,
    });

    if (error || !data) {
      return NextResponse.json(
        error ?? { message: 'Failed to create footer group' },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to create footer group' },
      { status: 502 },
    );
  }
}
