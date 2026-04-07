'use client';

import type { CmsContentListItem } from '@specus/api-client';
import { publicListContents } from '@specus/api-client';
import { Button } from '@specus/ui/components/button';
import { Loader2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { BlogCard } from './blog-card';

interface BlogLoadMoreProps {
  initialCursor: string | null;
  hasMore: boolean;
}

export function BlogLoadMore({ initialCursor, hasMore }: BlogLoadMoreProps) {
  const [posts, setPosts] = useState<CmsContentListItem[]>([]);
  const cursorRef = useRef<string | null>(initialCursor);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!cursorRef.current || isPending) return;

    startTransition(async () => {
      try {
        const response = await publicListContents({
          query: {
            content_type: 'blog_post',
            page_size: 12,
            cursor: cursorRef.current!,
          },
        });

        const data = response.data;
        if (data) {
          setPosts((prev) => [...prev, ...data.items]);
          cursorRef.current = data.pagination.next_cursor ?? null;
          setCanLoadMore(data.pagination.has_more);
        }
      } catch {
        // Silently handle — the user can retry
      }
    });
  };

  return (
    <>
      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}

      {canLoadMore ? (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {isPending ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      ) : null}
    </>
  );
}
