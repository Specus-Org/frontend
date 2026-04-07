'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@specus/ui/components/avatar';
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
import type { CmsAuthor } from '@specus/api-client';
import dynamic from 'next/dynamic';
import { fetcher } from '@/lib/fetcher';

const AuthorDialog = dynamic(
  () => import('@/components/authors/author-dialog').then((m) => m.AuthorDialog),
);

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

interface AuthorsResponse {
  items: CmsAuthor[];
}

export default function AuthorsPage() {
  const { data, isLoading, mutate } = useSWR<AuthorsResponse>(
    '/api/cms/authors',
    fetcher,
  );
  const authors = data?.items ?? [];

  // Dialog state — dialogKey forces fresh mount on each open
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<CmsAuthor | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<CmsAuthor | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleCreate() {
    setEditingAuthor(null);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function handleEdit(author: CmsAuthor) {
    setEditingAuthor(author);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/cms/authors/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        toast.success('Author deleted');
        mutate();
      } else if (response.status === 409) {
        toast.error('Cannot delete -- author is referenced by content');
      } else if (response.status === 404) {
        toast.info('Author was already deleted');
        mutate();
      } else {
        const data = await response.json();
        toast.error(data.message ?? 'Failed to delete author');
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
          <h1 className="text-2xl font-semibold tracking-tight">Authors</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage author profiles for your content.</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="size-4" />
          Add Author
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="hidden md:table-cell">Bio</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : authors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No authors yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <Avatar className="size-8">
                      {author.avatar_url && (
                        <AvatarImage
                          src={author.avatar_url}
                          alt={author.name}
                        />
                      )}
                      <AvatarFallback className="text-xs">
                        {getInitials(author.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {author.slug}
                  </TableCell>
                  <TableCell className="hidden max-w-xs text-muted-foreground md:table-cell">
                    {author.bio ? truncate(author.bio, 80) : '--'}
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
                        <DropdownMenuItem onClick={() => handleEdit(author)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(author)}
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

      {/* Create / Edit dialog */}
      <AuthorDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        author={editingAuthor}
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
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
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
