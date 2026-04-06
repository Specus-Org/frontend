'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { TagDialog } from '@/components/tags/tag-dialog';

export default function TagsPage() {
  const [tags, setTags] = useState<CmsTag[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<CmsTag | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/cms/tags');
      if (!response.ok) {
        toast.error('Failed to load tags');
        return;
      }
      const data = await response.json();
      setTags(data.items ?? []);
    } catch {
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/cms/tags/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        toast.success('Tag deleted');
        fetchTags();
      } else if (response.status === 409) {
        toast.error('Cannot delete -- tag is referenced by content');
      } else if (response.status === 404) {
        toast.info('Tag was already deleted');
        fetchTags();
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
        <div className="flex items-center gap-2">
          <Tag className="size-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          {!loading && (
            <Badge variant="secondary" className="ml-1">
              {tags.length}
            </Badge>
          )}
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="size-4" />
          Add Tag
        </Button>
      </div>

      {/* Tags grid */}
      {loading ? (
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchTags}
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
