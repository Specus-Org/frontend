import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { publicGetContentByTypeAndSlug } from '@specus/api-client';
import type { CmsContent } from '@specus/api-client';
import { ContentHeader } from '@/components/cms/content-header';
import { ContentBody } from '@/components/cms/content-body';
import { Button } from '@specus/ui/components/button';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchBlogPost(slug: string): Promise<CmsContent | null> {
  try {
    const response = await publicGetContentByTypeAndSlug({
      path: { content_type: 'blog_post', slug },
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await fetchBlogPost(slug);

  if (!content) {
    return {};
  }

  const title = content.meta_title ?? content.title;
  const description = content.meta_description ?? content.excerpt ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(content.og_image_url && {
        images: [{ url: content.og_image_url }],
      }),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const content = await fetchBlogPost(slug);

  if (!content) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href="/blog">
            <ArrowLeft className="size-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      <article className="space-y-8">
        <ContentHeader
          title={content.title}
          publishedAt={content.published_at}
          author={content.author}
          categories={content.categories}
          tags={content.tags}
        />
        <ContentBody body={content.body} />
      </article>
    </div>
  );
}
