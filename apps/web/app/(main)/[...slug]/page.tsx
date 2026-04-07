import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { publicResolvePagePath } from '@specus/api-client';
import type { CmsContent } from '@specus/api-client';
import { ContentHeader } from '@/components/cms/content-header';
import { ContentBody } from '@/components/cms/content-body';

interface CmsPageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Per-request cached content resolution. Ensures generateMetadata and
 * the page component share a single API call per request.
 */
const resolveContent = cache(async (
  slugSegments: string[],
): Promise<CmsContent | null> => {
  const path = '/' + slugSegments.join('/');

  try {
    const response = await publicResolvePagePath({ query: { path } });
    return response.data ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await resolveContent(slug);

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

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;
  const content = await resolveContent(slug);

  if (!content) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
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
