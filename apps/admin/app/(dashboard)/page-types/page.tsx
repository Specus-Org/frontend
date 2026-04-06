'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileType2, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import type { CmsPageType } from '@specus/api-client';
import { PageTypeDialog } from '@/components/page-types/page-type-dialog';

export default function PageTypesPage() {
  const [pageTypes, setPageTypes] = useState<CmsPageType[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<CmsPageType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPageTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/cms/page-types');
      if (!response.ok) {
        toast.error('Failed to load page types');
        return;
      }
      const data = await response.json();
      setPageTypes(data.items ?? []);
    } catch {
      toast.error('Failed to load page types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageTypes();
  }, [fetchPageTypes]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/cms/page-types/${deleteTarget.id}`,
        { method: 'DELETE' },
      );

      if (response.status === 204) {
        toast.success('Page type deleted');
        fetchPageTypes();
      } else if (response.status === 409) {
        toast.error('Cannot delete -- page type is referenced by content');
      } else if (response.status === 404) {
        toast.info('Page type was already deleted');
        fetchPageTypes();
      } else {
        const data = await response.json();
        toast.error(data.message ?? 'Failed to delete page type');
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
          <FileType2 className="size-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Page Types</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="size-4" />
          Add Page Type
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : pageTypes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No page types yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              pageTypes.map((pageType) => (
                <TableRow key={pageType.id}>
                  <TableCell className="font-medium">
                    {pageType.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pageType.slug}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {new Date(pageType.created_at).toLocaleDateString()}
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
                          onClick={() => setDeleteTarget(pageType)}
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

      {/* Create dialog */}
      <PageTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchPageTypes}
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
            <AlertDialogTitle>Delete Page Type</AlertDialogTitle>
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
