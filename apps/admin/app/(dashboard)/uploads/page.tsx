'use client';

import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@specus/ui/components/select';
import useSWR from 'swr';
import { EmptyState } from '@/components/empty-state';
import { UploadEditDialog } from '@/components/uploads/upload-edit-dialog';
import { UploadList } from '@/components/uploads/upload-list';
import { fetcher } from '@/lib/fetcher';
import type { CmsUploadExtended, CmsUploadListResponseExtended } from '@/types/uploads';

const UploadDialog = dynamic(
  () =>
    import('@/components/uploads/upload-dialog').then((m) => ({
      default: m.UploadDialog,
    })),
  { ssr: false },
);

const PAGE_SIZE = 20;

const UPLOAD_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
] as const;

function buildQuery(uploadType: string, status: string) {
  const params = new URLSearchParams();
  params.set('page_size', String(PAGE_SIZE));
  if (uploadType !== 'all') params.set('upload_type', uploadType);
  if (status !== 'all') params.set('status', status);
  return params.toString();
}

function replaceUpload(uploads: CmsUploadExtended[], updatedUpload: CmsUploadExtended) {
  return uploads.map((upload) => (upload.id === updatedUpload.id ? updatedUpload : upload));
}

export default function UploadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CmsUploadExtended | null>(null);
  const [uploadType, setUploadType] = useState('all');
  const [status, setStatus] = useState('all');
  const [isFilterPending, startFilterTransition] = useTransition();
  const [extraItems, setExtraItems] = useState<CmsUploadExtended[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [extraHasMore, setExtraHasMore] = useState(false);
  const [isLoadingMore, startLoadMoreTransition] = useTransition();
  const prevFilterRef = useRef(`${uploadType}:${status}`);

  const filterKey = `${uploadType}:${status}`;
  if (prevFilterRef.current !== filterKey) {
    prevFilterRef.current = filterKey;
    setExtraItems([]);
    setNextCursor(null);
    setExtraHasMore(false);
  }

  const query = buildQuery(uploadType, status);
  const { data, error, isLoading, mutate } = useSWR<CmsUploadListResponseExtended>(
    `/api/cms/uploads?${query}`,
    fetcher,
  );

  const baseItems = data?.items ?? [];
  const uploads = useMemo(() => [...baseItems, ...extraItems], [baseItems, extraItems]);
  const hasMore = extraHasMore || (data?.pagination.has_more ?? false);
  const effectiveCursor = nextCursor ?? data?.pagination.next_cursor ?? null;

  const handleDelete = useCallback(
    async (id: string) => {
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
            ? {
                ...current,
                items: current.items.filter((upload) => upload.id !== id),
              }
            : current,
        false,
      );
      setExtraItems((current) => current.filter((upload) => upload.id !== id));
    },
    [mutate],
  );

  const handleSaved = useCallback(
    (updatedUpload: CmsUploadExtended) => {
      mutate(
        (current) =>
          current
            ? {
                ...current,
                items: replaceUpload(current.items, updatedUpload),
              }
            : current,
        false,
      );
      setExtraItems((current) => replaceUpload(current, updatedUpload));
    },
    [mutate],
  );

  function handleUploadTypeChange(value: string) {
    startFilterTransition(() => {
      setUploadType(value);
    });
  }

  function handleStatusChange(value: string) {
    startFilterTransition(() => {
      setStatus(value);
    });
  }

  function handleLoadMore() {
    if (!effectiveCursor || isLoadingMore) return;

    startLoadMoreTransition(async () => {
      try {
        const params = new URLSearchParams();
        params.set('page_size', String(PAGE_SIZE));
        params.set('cursor', effectiveCursor);
        if (uploadType !== 'all') params.set('upload_type', uploadType);
        if (status !== 'all') params.set('status', status);

        const res = await fetch(`/api/cms/uploads?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load more uploads');

        const result: CmsUploadListResponseExtended = await res.json();
        setExtraItems((current) => [...current, ...result.items]);
        setNextCursor(result.pagination.next_cursor ?? null);
        setExtraHasMore(result.pagination.has_more);
      } catch {
        // Silently fail so the user can retry.
      }
    });
  }

  const hasActiveFilters = uploadType !== 'all' || status !== 'all';

  return (
    <div className="flex flex-1 flex-col gap-6">
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

      <div className="flex flex-wrap items-center gap-3">
        <Select value={uploadType} onValueChange={handleUploadTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Upload type" />
          </SelectTrigger>
          <SelectContent>
            {UPLOAD_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFilterPending ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
      </div>

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
      ) : uploads.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={hasActiveFilters ? 'No matching uploads' : 'No uploads yet'}
          description={
            hasActiveFilters
              ? 'Try a different filter combination to find uploads.'
              : 'Upload images and documents to use across your content.'
          }
          action={
            hasActiveFilters
              ? undefined
              : {
                  label: 'Upload File',
                  onClick: () => setDialogOpen(true),
                }
          }
        />
      ) : (
        <>
          <UploadList uploads={uploads} onDelete={handleDelete} onEdit={setEditTarget} />

          {hasMore ? (
            <div className="flex justify-center pb-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Load More
              </Button>
            </div>
          ) : null}
        </>
      )}

      {dialogOpen ? (
        <UploadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUploadComplete={() => mutate()}
        />
      ) : null}

      <UploadEditDialog
        upload={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onSaved={handleSaved}
      />
    </div>
  );
}
