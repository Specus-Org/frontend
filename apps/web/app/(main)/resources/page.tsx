import { FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { ResourceCard } from '@/components/resources/resource-card';
import { ResourceFilter } from '@/components/resources/resource-filter';
import { ResourcesLoadMore } from '@/components/resources/resources-load-more';
import { publicListUploads } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Confirmed uploads and downloadable assets from Specus',
};

interface ResourcesPageProps {
  searchParams: Promise<{ upload_type?: string }>;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const { upload_type } = await searchParams;
  const normalizedUploadType =
    upload_type === 'image' || upload_type === 'document' ? upload_type : undefined;
  let unavailableMessage: string | null = null;
  let uploads: Awaited<ReturnType<typeof publicListUploads>>['items'] = [];
  let pagination: Awaited<ReturnType<typeof publicListUploads>>['pagination'] = {
    has_more: false,
    next_cursor: null,
  };

  try {
    const data = await publicListUploads({
      page_size: 20,
      upload_type: normalizedUploadType,
    });

    uploads = data.items;
    pagination = data.pagination;
  } catch (error) {
    unavailableMessage =
      error instanceof Error && error.message.includes('status 404')
        ? 'The public upload library is not enabled in the current backend environment yet.'
        : 'Resources are temporarily unavailable. Please try again later.';
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 space-y-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">Resources</h1>
          <p className="mt-2 text-muted-foreground">
            Browse confirmed documents and images published through the CMS upload library.
          </p>
        </div>
        <ResourceFilter uploadType={normalizedUploadType ?? 'all'} />
      </div>

      {unavailableMessage ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">Resources unavailable</p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{unavailableMessage}</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">No resources available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different filter or check back once uploads are confirmed.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {uploads.map((upload) => (
              <ResourceCard key={upload.id} upload={upload} />
            ))}
          </div>

          <ResourcesLoadMore
            initialCursor={pagination.next_cursor ?? null}
            hasMore={pagination.has_more}
            uploadType={normalizedUploadType}
          />
        </>
      )}
    </div>
  );
}
