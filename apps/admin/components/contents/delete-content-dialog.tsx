'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

interface DeleteContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentTitle: string;
}

export function DeleteContentDialog({
  open,
  onOpenChange,
  contentId,
  contentTitle,
}: DeleteContentDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cms/contents/${contentId}`, {
        method: 'DELETE',
      });

      if (response.status === 409) {
        const data = await response.json().catch(() => null);
        toast.error('Cannot delete content', {
          description:
            data?.message ??
            'This content has child pages. Remove or reassign them first.',
        });
        return;
      }

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to delete content');
      }

      toast.success('Content deleted', {
        description: `"${contentTitle}" has been deleted.`,
      });
      router.push('/contents');
    } catch (err) {
      toast.error('Delete failed', {
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete content</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{contentTitle}&quot;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
