import type { CmsUploadPresignResponse } from '@specus/api-client';

interface ImageUploadResponse {
  success: 0 | 1;
  file: {
    url: string;
  };
}

interface ImageUploader {
  uploadByFile(file: File): Promise<ImageUploadResponse>;
  uploadByUrl(url: string): Promise<ImageUploadResponse>;
}

function getUploadType(contentType: string): 'image' | 'document' {
  const imageTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ]);
  return imageTypes.has(contentType) ? 'image' : 'document';
}

/**
 * Creates a custom uploader for @editorjs/image that follows
 * the existing presign → S3 PUT → confirm flow.
 */
export function createImageUploader(): ImageUploader {
  return {
    async uploadByFile(file: File): Promise<ImageUploadResponse> {
      try {
        // Step 1: Request presigned URL
        const presignRes = await fetch('/api/cms/uploads/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            content_type: file.type,
            upload_type: getUploadType(file.type),
            size_bytes: file.size,
          }),
        });

        if (!presignRes.ok) {
          const data = await presignRes.json().catch(() => null);
          throw new Error(
            data?.message ?? 'Failed to get upload URL from server',
          );
        }

        const presignData: CmsUploadPresignResponse = await presignRes.json();

        // Step 2: Upload file directly to storage (presigned URL)
        const uploadRes = await fetch(presignData.upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error(
            `Storage upload failed with status ${uploadRes.status}`,
          );
        }

        // Step 3: Confirm the upload
        const confirmRes = await fetch(
          `/api/cms/uploads/${presignData.upload_id}/confirm`,
          { method: 'POST' },
        );

        if (!confirmRes.ok) {
          const data = await confirmRes.json().catch(() => null);
          throw new Error(data?.message ?? 'Failed to confirm upload');
        }

        return {
          success: 1,
          file: { url: presignData.public_url },
        };
      } catch (err) {
        console.error('Image upload failed:', err);
        return {
          success: 0,
          file: { url: '' },
        };
      }
    },

    async uploadByUrl(url: string): Promise<ImageUploadResponse> {
      return {
        success: 1,
        file: { url },
      };
    },
  };
}
