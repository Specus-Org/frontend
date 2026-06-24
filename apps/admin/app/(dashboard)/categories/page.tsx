'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Plus, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Button } from '@specus/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@specus/ui/components/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@specus/ui/components/dropdown-menu';
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
import type { CmsCategory } from '@specus/api-client';
import dynamic from 'next/dynamic';
import { fetcher } from '@/lib/fetcher';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

const CategoryDialog = dynamic(
  () =>
    import('@/components/categories/category-dialog').then(
      (m) => m.CategoryDialog,
    ),
);

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

interface CategoriesResponse {
  items: CmsCategory[];
}

export default function CategoriesPage() {
  const { data, isLoading, mutate } = useSWR<CategoriesResponse>(
    '/api/cms/categories',
    fetcher,
  );
  const categories = data?.items ?? [];

  // Dialog state — dialogKey forces fresh mount on each open
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CmsCategory | null>(
    null,
  );
  const [dialogKey, setDialogKey] = useState(0);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<CmsCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleCreate() {
    setEditingCategory(null);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function handleEdit(category: CmsCategory) {
    setEditingCategory(category);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/cms/categories/${deleteTarget.id}`,
        { method: 'DELETE' },
      );

      if (response.status === 204) {
        toast.success('Category deleted');
        mutate();
      } else if (response.status === 409) {
        toast.error('Cannot delete -- category is referenced by content');
      } else if (response.status === 404) {
        toast.info('Category was already deleted');
        mutate();
      } else {
        const data = await response.json();
        toast.error(data.message ?? 'Failed to delete category');
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
      <PageHeader
        title="Categories"
        description="Organize content into categories."
        action={
          <Button onClick={handleCreate} size="sm">
            <Plus className="size-4" />
            Add Category
          </Button>
        }
      />

      {!isLoading && categories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No categories yet"
          description="Create a category to organize your content."
          action={{ label: 'Add Category', onClick: handleCreate }}
        />
      ) : (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell className="hidden max-w-xs text-muted-foreground md:table-cell">
                    {category.description
                      ? truncate(category.description, 80)
                      : '--'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(category)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      )}

      {/* Create / Edit dialog */}
      <CategoryDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
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
