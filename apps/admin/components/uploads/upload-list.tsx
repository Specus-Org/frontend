'use client';

import { useState } from 'react';
import { File, Image, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { Card, CardContent } from '@specus/ui/components/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@specus/ui/components/alert-dialog';
import { toast } from 'sonner';
import type { CmsUpload } from '@specus/api-client';

interface UploadListProps {
  uploads: CmsUpload[];
  onDelete: (id: string) => Promise<void>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('URL copied to clipboard');
  });
}

function ImageGrid({
  uploads,
  onDeleteClick,
}: {
  uploads: CmsUpload[];
  onDeleteClick: (upload: CmsUpload) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        Images ({uploads.length})
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {uploads.map((upload) => (
          <Card
            key={upload.id}
            className="group relative overflow-hidden pt-0"
          >
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={upload.public_url}
                  alt={upload.filename}
                  className="size-full object-cover"
                  loading="lazy"
                />
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8"
                    onClick={() => copyToClipboard(upload.public_url)}
                    title="Copy URL"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8"
                    onClick={() => window.open(upload.public_url, '_blank')}
                    title="Open in new tab"
                  >
                    <ExternalLink className="size-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="size-8"
                    onClick={() => onDeleteClick(upload)}
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <p
                  className="truncate text-xs font-medium"
                  title={upload.filename}
                >
                  {upload.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {upload.size_bytes
                    ? formatFileSize(upload.size_bytes)
                    : 'Unknown size'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DocumentList({
  uploads,
  onDeleteClick,
}: {
  uploads: CmsUpload[];
  onDeleteClick: (upload: CmsUpload) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        Documents ({uploads.length})
      </h2>
      <div className="space-y-2">
        {uploads.map((upload) => (
          <Card key={upload.id} className="group">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <File className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={upload.filename}>
                  {upload.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {upload.content_type}
                  {upload.size_bytes
                    ? ` \u00B7 ${formatFileSize(upload.size_bytes)}`
                    : ''}
                  {' \u00B7 '}
                  {formatDate(upload.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => copyToClipboard(upload.public_url)}
                  title="Copy URL"
                >
                  <Copy className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => window.open(upload.public_url, '_blank')}
                  title="Open in new tab"
                >
                  <ExternalLink className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => onDeleteClick(upload)}
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function UploadList({ uploads, onDelete }: UploadListProps) {
  const [deleteTarget, setDeleteTarget] = useState<CmsUpload | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const images = uploads.filter((u) => u.upload_type === 'image');
  const documents = uploads.filter((u) => u.upload_type === 'document');

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await onDelete(deleteTarget.id);
      toast.success(`Deleted "${deleteTarget.filename}"`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (uploads.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Image className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No files uploaded yet</h3>
        <p className="mb-4 mt-2 max-w-sm text-sm text-muted-foreground">
          Upload images and documents to use across your content.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {images.length > 0 && (
          <ImageGrid uploads={images} onDeleteClick={setDeleteTarget} />
        )}
        {documents.length > 0 && (
          <DocumentList uploads={documents} onDeleteClick={setDeleteTarget} />
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.filename}
              &rdquo;? This action cannot be undone and any content referencing
              this file will lose access to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
