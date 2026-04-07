'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { toast } from 'sonner';
import useSWR from 'swr';
import type { CmsUpload, CmsUploadListResponse } from '@specus/api-client';
import { UploadList } from '@/components/uploads/upload-list';
import { fetcher } from '@/lib/fetcher';

const UploadDialog = dynamic(
  () =>
    import('@/components/uploads/upload-dialog').then((m) => ({
      default: m.UploadDialog,
    })),
  { ssr: false },
);

export default function UploadsPage() {
  const { data, error, isLoading, mutate } = useSWR<CmsUploadListResponse>(
    '/api/cms/uploads',
    fetcher,
  );
  const uploads = data?.items ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/cms/uploads/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message ?? 'Failed to delete upload');
    }

    mutate(
      (current) =>
        current
          ? { ...current, items: current.items.filter((u) => u.id !== id) }
          : current,
      false,
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Uploads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button variant="outline" onClick={() => mutate()}>
            Try again
          </Button>
        </div>
      ) : (
        <UploadList uploads={uploads} onDelete={handleDelete} />
      )}

      {/* Upload dialog (dynamically imported) */}
      {dialogOpen && (
        <UploadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUploadComplete={() => mutate()}
        />
      )}
    </div>
  );
}
