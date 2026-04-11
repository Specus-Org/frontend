'use client';

import { useRef, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { publicListUploads } from '@/lib/uploads';
import type { CmsUploadPublic } from '@/types/uploads';
import { ResourceCard } from './resource-card';

interface ResourcesLoadMoreProps {
  initialCursor: string | null;
  hasMore: boolean;
  uploadType?: 'image' | 'document';
}

const PAGE_SIZE = 20;

export function ResourcesLoadMore({ initialCursor, hasMore, uploadType }: ResourcesLoadMoreProps) {
  const [uploads, setUploads] = useState<CmsUploadPublic[]>([]);
  const cursorRef = useRef<string | null>(initialCursor);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!cursorRef.current || isPending) return;

    startTransition(async () => {
      try {
        const data = await publicListUploads({
          cursor: cursorRef.current!,
          page_size: PAGE_SIZE,
          upload_type: uploadType,
        });

        setUploads((current) => [...current, ...data.items]);
        cursorRef.current = data.pagination.next_cursor ?? null;
        setCanLoadMore(data.pagination.has_more);
      } catch {
        // Silently handle so the user can retry.
      }
    });
  }

  return (
    <>
      {uploads.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uploads.map((upload) => (
            <ResourceCard key={upload.id} upload={upload} />
          ))}
        </div>
      ) : null}

      {canLoadMore ? (
        <div className="flex justify-center pt-8">
          <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {isPending ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      ) : null}
    </>
  );
}
