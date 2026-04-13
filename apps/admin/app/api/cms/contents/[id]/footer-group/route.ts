import { NextResponse, type NextRequest } from 'next/server';
import {
  adminAssignContentToFooter,
  adminUnassignContentFromFooter,
  type CmsAssignFooterRequest,
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

/**
 * Placeholder content-footer-group proxy.
 *
 * The generated SDK now supports assign/unassign, but it still does not expose
 * a dedicated "get current footer assignment" operation. This GET route stays
 * as a placeholder until that lookup contract exists.
 */
export async function GET(_request: NextRequest, _context: RouteContext) {
  return NextResponse.json({
    current_footer_group_id: null,
    current_footer_group: null,
    integration_ready: false,
    message:
      'Footer membership lookup is scaffolded because the generated API client does not expose a read endpoint yet.',
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as CmsAssignFooterRequest;
    const { data, error, response } = await adminAssignContentToFooter({
      body,
      headers,
      path: { id },
    });

    if (error) {
      return NextResponse.json(error, { status: response.status });
    }

    return NextResponse.json(data ?? { success: true });
  } catch {
    return NextResponse.json(
      { message: 'Failed to assign footer group' },
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
    const { data, error, response } = await adminUnassignContentFromFooter({
      headers,
      path: { id },
    });

    if (error) {
      return NextResponse.json(error, { status: response.status });
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(data ?? { success: true });
  } catch {
    return NextResponse.json(
      { message: 'Failed to remove footer group' },
      { status: 502 },
    );
  }
}
