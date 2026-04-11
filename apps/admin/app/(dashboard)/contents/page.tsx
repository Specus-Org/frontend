'use client';

import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Plus } from 'lucide-react';
import useSWR from 'swr';
import { Button } from '@specus/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@specus/ui/components/select';
import type {
  CmsContentListItem,
  CmsContentListResponse,
} from '@specus/api-client';
import { DataTable } from '@/components/contents/data-table';
import { getColumns } from '@/components/contents/columns';
import { EmptyState } from '@/components/empty-state';
import { fetcher } from '@/lib/fetcher';

const PAGE_SIZE = 20;

const CONTENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'static_page', label: 'Static Page' },
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'flexible_page', label: 'Flexible Page' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
] as const;

function buildQuery(contentType: string, status: string) {
  const params = new URLSearchParams();
  params.set('page_size', String(PAGE_SIZE));
  if (contentType !== 'all') params.set('content_type', contentType);
  if (status !== 'all') params.set('status', status);
  return params.toString();
}

export default function ContentsPage() {
  const router = useRouter();
  const [isFilterPending, startFilterTransition] = useTransition();

  // Filter state
  const [contentType, setContentType] = useState('all');
  const [status, setStatus] = useState('all');

  // Load-more state
  const [extraItems, setExtraItems] = useState<CmsContentListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [extraHasMore, setExtraHasMore] = useState(false);
  const [isLoadingMore, startLoadMoreTransition] = useTransition();
  const prevFilterRef = useRef(`${contentType}:${status}`);
  const filterEpochRef = useRef(0);

  // Reset extra items when filters change
  const filterKey = `${contentType}:${status}`;
  if (prevFilterRef.current !== filterKey) {
    prevFilterRef.current = filterKey;
    filterEpochRef.current += 1;
    setExtraItems([]);
    setNextCursor(null);
    setExtraHasMore(false);
  }

  const query = buildQuery(contentType, status);
  const { data, error, isLoading, mutate } = useSWR<CmsContentListResponse>(
    `/api/cms/contents?${query}`,
    fetcher,
  );

  const allItems = useMemo(
    () => [...(data?.items ?? []), ...extraItems],
    [data?.items, extraItems],
  );
  const hasMore = extraHasMore || (data?.pagination.has_more ?? false);
  const effectiveCursor = nextCursor ?? data?.pagination.next_cursor ?? null;

  // Remove a row after deletion (optimistic update)
  const handleDeleted = useCallback(
    (id: string) => {
      mutate(
        (current) =>
          current
            ? {
                ...current,
                items: current.items.filter((item) => item.id !== id),
              }
            : current,
        false,
      );
      setExtraItems((prev) => prev.filter((item) => item.id !== id));
    },
    [mutate],
  );

  const columns = useMemo(() => getColumns(handleDeleted), [handleDeleted]);

  function handleLoadMore() {
    if (!effectiveCursor || isLoadingMore) return;

    const requestEpoch = filterEpochRef.current;
    const requestCursor = effectiveCursor;

    startLoadMoreTransition(async () => {
      try {
        const params = new URLSearchParams();
        params.set('page_size', String(PAGE_SIZE));
        if (contentType !== 'all') params.set('content_type', contentType);
        if (status !== 'all') params.set('status', status);
        params.set('cursor', requestCursor);

        const res = await fetch(`/api/cms/contents?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load more content');
        const result: CmsContentListResponse = await res.json();
        if (filterEpochRef.current !== requestEpoch) return;

        setExtraItems((prev) => [...prev, ...result.items]);
        setNextCursor(result.pagination.next_cursor ?? null);
        setExtraHasMore(result.pagination.has_more);
      } catch {
        // Silently fail — user can retry
      }
    });
  }

  function handleContentTypeChange(value: string) {
    startFilterTransition(() => {
      setContentType(value);
    });
  }

  function handleStatusChange(value: string) {
    startFilterTransition(() => {
      setStatus(value);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your pages, blog posts, and other content.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/contents/new">
            <Plus className="size-4" />
            New Content
          </Link>
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={contentType} onValueChange={handleContentTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Content type" />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_TYPE_OPTIONS.map((option) => (
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

        {isFilterPending && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
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
      ) : allItems.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No content yet"
          description="Create your first page or blog post to get started."
          action={{ label: 'New Content', href: '/contents/new' }}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={allItems}
            onRowClick={(row) =>
              router.push(`/contents/${(row as CmsContentListItem).id}`)
            }
          />

          {hasMore && (
            <div className="flex justify-center pb-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
