'use client';

import { useState } from 'react';
import { Copy, ExternalLink, File, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { Badge } from '@specus/ui/components/badge';
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
import type { CmsUploadExtended } from '@/types/uploads';

interface UploadListProps {
  uploads: CmsUploadExtended[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (upload: CmsUploadExtended) => void;
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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard');
  } catch {
    toast.error('Could not copy URL');
  }
}

function getDisplayName(upload: CmsUploadExtended) {
  return upload.title?.trim() || upload.filename;
}

function UploadStatusBadge({ status }: { status: CmsUploadExtended['status'] }) {
  if (status === 'confirmed') {
    return (
      <Badge
        variant="default"
        className="border-transparent bg-green-500/15 text-green-700 hover:bg-green-500/15 dark:text-green-400"
      >
        Confirmed
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-yellow-500/30 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400"
    >
      Pending
    </Badge>
  );
}

function ImageGrid({
  uploads,
  onDeleteClick,
  onEditClick,
}: {
  uploads: CmsUploadExtended[];
  onDeleteClick: (upload: CmsUploadExtended) => void;
  onEditClick: (upload: CmsUploadExtended) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Images ({uploads.length})</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {uploads.map((upload) => {
          const displayName = getDisplayName(upload);

          return (
            <Card key={upload.id} className="group relative overflow-hidden pt-0">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={upload.public_url}
                    alt={upload.alt_text?.trim() || displayName}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-8"
                      onClick={() => onEditClick(upload)}
                      title="Edit metadata"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
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
                <div className="space-y-2 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-medium" title={displayName}>
                      {displayName}
                    </p>
                    <UploadStatusBadge status={upload.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {upload.size_bytes ? formatFileSize(upload.size_bytes) : 'Unknown size'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DocumentList({
  uploads,
  onDeleteClick,
  onEditClick,
}: {
  uploads: CmsUploadExtended[];
  onDeleteClick: (upload: CmsUploadExtended) => void;
  onEditClick: (upload: CmsUploadExtended) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        Documents ({uploads.length})
      </h2>
      <div className="space-y-2">
        {uploads.map((upload) => {
          const displayName = getDisplayName(upload);

          return (
            <Card key={upload.id} className="group">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <File className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium" title={displayName}>
                      {displayName}
                    </p>
                    <UploadStatusBadge status={upload.status} />
                  </div>

                  {upload.title && upload.title !== upload.filename ? (
                    <p className="truncate text-xs text-muted-foreground" title={upload.filename}>
                      {upload.filename}
                    </p>
                  ) : null}

                  {upload.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {upload.description}
                    </p>
                  ) : null}

                  <p className="text-xs text-muted-foreground">
                    {upload.content_type}
                    {upload.size_bytes ? ` \u00B7 ${formatFileSize(upload.size_bytes)}` : ''}
                    {' \u00B7 '}
                    {formatDate(upload.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onEditClick(upload)}
                    title="Edit metadata"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
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
          );
        })}
      </div>
    </div>
  );
}

export function UploadList({ uploads, onDelete, onEdit }: UploadListProps) {
  const [deleteTarget, setDeleteTarget] = useState<CmsUploadExtended | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const images = uploads.filter((upload) => upload.upload_type === 'image');
  const documents = uploads.filter((upload) => upload.upload_type === 'document');

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await onDelete(deleteTarget.id);
      toast.success(`Deleted "${getDisplayName(deleteTarget)}"`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {images.length > 0 ? (
          <ImageGrid uploads={images} onDeleteClick={setDeleteTarget} onEditClick={onEdit} />
        ) : null}

        {documents.length > 0 ? (
          <DocumentList uploads={documents} onDeleteClick={setDeleteTarget} onEditClick={onEdit} />
        ) : null}
      </div>

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
              Are you sure you want to delete &ldquo;
              {deleteTarget ? getDisplayName(deleteTarget) : ''}
              &rdquo;? This action cannot be undone and any content referencing this file will lose
              access to it.
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
