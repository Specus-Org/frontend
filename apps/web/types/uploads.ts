import type { CmsPaginationMeta, CmsUpload } from '@specus/api-client';

export type CmsUploadPublic = Omit<CmsUpload, 'status' | 'storage_key'> & {
  title?: string | null;
  description?: string | null;
  alt_text?: string | null;
};

export interface CmsUploadPublicListResponse {
  items: CmsUploadPublic[];
  pagination: CmsPaginationMeta;
}

export interface PublicListUploadsParams {
  cursor?: string;
  page_size?: number;
  upload_type?: 'image' | 'document';
}
