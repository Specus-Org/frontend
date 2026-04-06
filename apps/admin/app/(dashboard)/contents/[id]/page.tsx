'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@specus/ui/components/button';
import { Skeleton } from '@specus/ui/components/skeleton';
import type { CmsContent } from '@specus/api-client';
import {
  ContentForm,
  type ContentFormValues,
} from '@/components/contents/content-form';
import { DeleteContentDialog } from '@/components/contents/delete-content-dialog';

export default function EditContentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [content, setContent] = useState<CmsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch(`/api/cms/contents/${params.id}`);
      if (response.status === 404) {
        setNotFound(true);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      const data: CmsContent = await response.json();
      setContent(data);
    } catch {
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  async function handleSubmit(values: ContentFormValues) {
    setIsSubmitting(true);
    try {
      const body = {
        title: values.title,
        slug: values.slug,
        body: values.body || null,
        excerpt: values.excerpt || null,
        status: values.status,
        publish_at: values.publish_at || null,
        author_id: values.author_id || null,
        page_type_id: values.page_type_id || null,
        parent_id: values.parent_id || null,
        sort_order: values.sort_order,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
        og_image_url: values.og_image_url || null,
        category_ids: values.category_ids ?? [],
        tag_ids: values.tag_ids ?? [],
      };

      const response = await fetch(`/api/cms/contents/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error('Failed to update content', {
          description: data?.message ?? 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Content updated', {
        description: `"${values.title}" has been updated.`,
      });
      router.push('/contents');
    } catch {
      toast.error('Network error', {
        description: 'Could not reach the server. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-64" />
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !content) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-muted-foreground">
          Content not found
        </p>
        <p className="text-sm text-muted-foreground">
          The content you are looking for does not exist or has been deleted.
        </p>
        <Button variant="outline" asChild>
          <Link href="/contents">
            <ArrowLeft className="mr-2 size-4" />
            Back to contents
          </Link>
        </Button>
      </div>
    );
  }

  // Convert CmsContent to form default values
  const defaultValues: Partial<ContentFormValues> = {
    title: content.title,
    slug: content.slug,
    content_type: content.content_type,
    body: content.body ?? '',
    excerpt: content.excerpt ?? '',
    status: content.status,
    publish_at: content.publish_at
      ? content.publish_at.slice(0, 16) // Format for datetime-local input
      : null,
    author_id: content.author_id ?? null,
    category_ids: content.categories?.map((c) => c.id) ?? [],
    tag_ids: content.tags?.map((t) => t.id) ?? [],
    page_type_id: content.page_type_id ?? null,
    parent_id: content.parent_id ?? null,
    sort_order: content.sort_order,
    meta_title: content.meta_title ?? '',
    meta_description: content.meta_description ?? '',
    og_image_url: content.og_image_url ?? '',
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/contents">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to contents</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit Content
            </h1>
            <p className="mt-1 text-muted-foreground">{content.title}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="mr-2 size-4" />
          Delete
        </Button>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <ContentForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Delete dialog */}
      <DeleteContentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        contentId={content.id}
        contentTitle={content.title}
      />
    </div>
  );
}
