import { NextResponse, type NextRequest } from 'next/server';
import {
  adminAssignContentToFooter,
  adminGetContent,
  adminListFooterGroups,
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

export async function GET(_request: NextRequest, context: RouteContext) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const { data: content, error, response } = await adminGetContent({
      headers,
      path: { id },
    });

    if (error || !content) {
      return NextResponse.json(
        error ?? { message: 'Failed to fetch footer assignment' },
        { status: response.status },
      );
    }

    const currentFooterGroupId = content.footer?.group_id ?? null;
    const footerSortOrder = content.footer?.sort_order ?? null;

    let currentFooterGroup = null;
    let message: string | undefined;

    if (currentFooterGroupId) {
      const footerGroupsResult = await adminListFooterGroups({ headers });

      if (footerGroupsResult.data) {
        currentFooterGroup =
          footerGroupsResult.data.items.find(
            (footerGroup) => footerGroup.id === currentFooterGroupId,
          ) ?? null;

        if (!currentFooterGroup) {
          message =
            'This content is assigned to a footer group that is not present in the current footer group list.';
        }
      } else {
        message =
          'Footer assignment was found, but the current footer group details could not be loaded.';
      }
    }

    return NextResponse.json({
      current_footer_group_id: currentFooterGroupId,
      current_footer_group: currentFooterGroup,
      footer_sort_order: footerSortOrder,
      is_assigned: currentFooterGroupId !== null,
      integration_ready: true,
      message,
    });
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch footer assignment' },
      { status: 502 },
    );
  }
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
