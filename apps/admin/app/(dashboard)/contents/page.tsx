'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Plus } from 'lucide-react';
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

export default function ContentsPage() {
  const router = useRouter();

  // Filter state
  const [contentType, setContentType] = useState('all');
  const [status, setStatus] = useState('all');

  // Data state
  const [items, setItems] = useState<CmsContentListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build the query string for the proxy route
  const buildQuery = useCallback(
    (cursor?: string | null) => {
      const params = new URLSearchParams();
      params.set('page_size', String(PAGE_SIZE));
      if (contentType !== 'all') params.set('content_type', contentType);
      if (status !== 'all') params.set('status', status);
      if (cursor) params.set('cursor', cursor);
      return params.toString();
    },
    [contentType, status],
  );

  // Fetch contents from the proxy route
  const fetchContents = useCallback(
    async (cursor?: string | null) => {
      const query = buildQuery(cursor);
      const response = await fetch(`/api/cms/contents?${query}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to fetch contents');
      }
      return (await response.json()) as CmsContentListResponse;
    },
    [buildQuery],
  );

  // Initial fetch and re-fetch on filter change
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchContents();
        if (!cancelled) {
          setItems(data.items);
          setNextCursor(data.pagination.next_cursor ?? null);
          setHasMore(data.pagination.has_more);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'An unexpected error occurred',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchContents]);

  // Load more handler for cursor pagination
  async function handleLoadMore() {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const data = await fetchContents(nextCursor);
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.pagination.next_cursor ?? null);
      setHasMore(data.pagination.has_more);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load more content',
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  // Remove a row after deletion
  const handleDeleted = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Memoize columns so TanStack Table doesn't re-render on every state update
  const columns = useMemo(() => getColumns(handleDeleted), [handleDeleted]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your pages, blog posts, and other content.
          </p>
        </div>
        <Button asChild>
          <Link href="/contents/new">
            <Plus className="mr-2 size-4" />
            New Content
          </Link>
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={contentType} onValueChange={setContentType}>
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

        <Select value={status} onValueChange={setStatus}>
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
              fetchContents()
                .then((data) => {
                  setItems(data.items);
                  setNextCursor(data.pagination.next_cursor ?? null);
                  setHasMore(data.pagination.has_more);
                })
                .catch((err) =>
                  setError(
                    err instanceof Error
                      ? err.message
                      : 'An unexpected error occurred',
                  ),
                )
                .finally(() => setIsLoading(false));
            }}
          >
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
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
            data={items}
            onRowClick={(row) =>
              router.push(`/contents/${(row as CmsContentListItem).id}`)
            }
          />

          {/* Load More */}
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
