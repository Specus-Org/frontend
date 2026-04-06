'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { toast } from 'sonner';
import type { CmsUpload, CmsUploadListResponse } from '@specus/api-client';
import { UploadList } from '@/components/uploads/upload-list';
import { UploadDialog } from '@/components/uploads/upload-dialog';

export default function UploadsPage() {
  const [uploads, setUploads] = useState<CmsUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUploads = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/uploads');
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to fetch uploads');
      }
      const data: CmsUploadListResponse = await res.json();
      setUploads(data.items);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/cms/uploads/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message ?? 'Failed to delete upload');
    }

    setUploads((prev) => prev.filter((u) => u.id !== id));
  }

  function handleUploadComplete() {
    fetchUploads();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uploads</h1>
          <p className="mt-1 text-muted-foreground">
            Manage images and documents for your content.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Upload className="mr-2 size-4" />
          Upload File
        </Button>
      </div>

      {/* Content area */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchUploads();
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <UploadList uploads={uploads} onDelete={handleDelete} />
      )}

      {/* Upload dialog */}
      <UploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
