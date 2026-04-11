import type { CmsPaginationMeta, CmsUpload } from '@specus/api-client';

export type CmsUploadExtended = CmsUpload & {
  title?: string | null;
  description?: string | null;
  alt_text?: string | null;
};

export interface CmsUploadListResponseExtended {
  items: CmsUploadExtended[];
  pagination: CmsPaginationMeta;
}

export interface CmsUploadUpdateRequest {
  title?: string | null;
  description?: string | null;
  alt_text?: string | null;
}
