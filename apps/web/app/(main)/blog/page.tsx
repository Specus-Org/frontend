import { publicListContents } from '@specus/api-client';
import { BlogCard } from '@/components/cms/blog-card';
import { BlogLoadMore } from '@/components/cms/blog-load-more';
import { FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest articles and updates from Specus',
};

export default async function BlogPage() {
  const response = await publicListContents({
    query: { content_type: 'blog_post', page_size: 12 },
  });

  const data = response.data;
  const posts = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Latest articles and updates from Specus
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            No blog posts yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon for new articles.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          <BlogLoadMore
            initialCursor={pagination?.next_cursor ?? null}
            hasMore={pagination?.has_more ?? false}
          />
        </>
      )}
    </div>
  );
}
