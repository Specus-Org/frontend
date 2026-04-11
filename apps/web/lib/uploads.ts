import { getApiBaseUrl } from '@/lib/api';
import type { CmsUploadPublicListResponse, PublicListUploadsParams } from '@/types/uploads';

export async function publicListUploads(
  params: PublicListUploadsParams = {},
): Promise<CmsUploadPublicListResponse> {
  const searchParams = new URLSearchParams();

  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.page_size) {
    searchParams.set('page_size', String(params.page_size));
  }
  if (params.upload_type) {
    searchParams.set('upload_type', params.upload_type);
  }

  const query = searchParams.toString();
  const response = await fetch(`${getApiBaseUrl()}/api/v1/cms/uploads${query ? `?${query}` : ''}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load uploads (status ${response.status})`);
  }

  return response.json() as Promise<CmsUploadPublicListResponse>;
}
