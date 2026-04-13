'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import type { FooterGroup } from '@/components/footer-groups/types';

interface FooterGroupsTableProps {
  footerGroups: FooterGroup[];
  isLoading: boolean;
  actionsDisabled?: boolean;
  onEdit: (footerGroup: FooterGroup) => void;
  onDeleted: () => void;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

export function FooterGroupsTable({
  footerGroups,
  isLoading,
  actionsDisabled = false,
  onEdit,
  onDeleted,
}: FooterGroupsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<FooterGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/cms/footer-groups/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok && response.status !== 204) {
        toast.error(data?.message ?? 'Failed to delete footer group');
        return;
      }

      toast.success('Footer group deleted');
      onDeleted();
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
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
            ) : footerGroups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No footer groups yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              footerGroups.map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  <TableCell className="font-medium">{footerGroup.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {footerGroup.slug}
                  </TableCell>
                  <TableCell className="hidden max-w-xs text-muted-foreground md:table-cell">
                    {footerGroup.description
                      ? truncate(footerGroup.description, 80)
                      : '--'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={actionsDisabled}
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(footerGroup)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(footerGroup)}
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Footer Group</AlertDialogTitle>
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
    </>
  );
}
