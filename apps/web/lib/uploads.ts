import { getApiBaseUrl } from '@/lib/api';
import type { CmsUploadPublicListResponse, PublicListUploadsParams } from '@/types/uploads';

function buildPublicUploadsUrl(params: PublicListUploadsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.page_size != null) {
    searchParams.set('page_size', String(params.page_size));
  }
  if (params.upload_type) {
    searchParams.set('upload_type', params.upload_type);
  }

  const query = searchParams.toString();
  const path =
    typeof window === 'undefined' ? `${getApiBaseUrl()}/api/v1/cms/uploads` : '/api/cms/uploads';

  return `${path}${query ? `?${query}` : ''}`;
}

export async function publicListUploads(
  params: PublicListUploadsParams = {},
): Promise<CmsUploadPublicListResponse> {
  const response = await fetch(buildPublicUploadsUrl(params), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load uploads (status ${response.status})`);
  }

  return response.json() as Promise<CmsUploadPublicListResponse>;
}
