'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@specus/ui/components/button';
import {
  ContentForm,
  type ContentFormValues,
} from '@/components/contents/content-form';

export default function NewContentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: ContentFormValues) {
    setIsSubmitting(true);
    try {
      const body = {
        ...values,
        body: values.body || null,
        excerpt: values.excerpt || null,
        publish_at: values.publish_at || null,
        author_id: values.author_id || null,
        page_type_id: values.page_type_id || null,
        parent_id: values.parent_id || null,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
        og_image_url: values.og_image_url || null,
        category_ids: values.category_ids ?? [],
        tag_ids: values.tag_ids ?? [],
      };

      const response = await fetch('/api/cms/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error('Failed to create content', {
          description: data?.message ?? 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Content created', {
        description: `"${values.title}" has been created.`,
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

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contents">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to contents</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Content</h1>
          <p className="mt-1 text-muted-foreground">
            Create a new page, blog post, or flexible page.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <ContentForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
