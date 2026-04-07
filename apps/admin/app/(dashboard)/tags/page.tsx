'use client';

import { useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Button } from '@specus/ui/components/button';
import { Badge } from '@specus/ui/components/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@specus/ui/components/alert-dialog';
import type { CmsTag } from '@specus/api-client';
import dynamic from 'next/dynamic';
import { fetcher } from '@/lib/fetcher';

const TagDialog = dynamic(
  () => import('@/components/tags/tag-dialog').then((m) => m.TagDialog),
);

interface TagsResponse {
  items: CmsTag[];
}

export default function TagsPage() {
  const { data, isLoading, mutate } = useSWR<TagsResponse>(
    '/api/cms/tags',
    fetcher,
  );
  const tags = data?.items ?? [];

  // Dialog state — dialogKey forces fresh mount on each open
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<CmsTag | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/cms/tags/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        toast.success('Tag deleted');
        mutate();
      } else if (response.status === 409) {
        toast.error('Cannot delete -- tag is referenced by content');
      } else if (response.status === 404) {
        toast.info('Tag was already deleted');
        mutate();
      } else {
        const data = await response.json();
        toast.error(data.message ?? 'Failed to delete tag');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
            {!isLoading ? (
              <Badge variant="secondary">
                {tags.length}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Label and organize content with tags.</p>
        </div>
        <Button onClick={() => { setDialogKey((k) => k + 1); setDialogOpen(true); }} size="sm">
          <Plus className="size-4" />
          Add Tag
        </Button>
      </div>

      {/* Tags grid */}
      {isLoading ? (
        <div className="flex h-24 items-center justify-center text-muted-foreground">
          Loading...
        </div>
      ) : tags.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-muted-foreground">
          No tags yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{tag.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {tag.slug}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setDeleteTarget(tag)}
              >
                <Trash2 className="size-4 text-destructive" />
                <span className="sr-only">Delete {tag.name}</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <TagDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => mutate()}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{deleteTarget?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
