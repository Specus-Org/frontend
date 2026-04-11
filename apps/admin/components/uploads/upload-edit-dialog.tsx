'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Loader2 } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@specus/ui/components/dialog';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { Textarea } from '@specus/ui/components/textarea';
import { toast } from 'sonner';
import type { CmsUploadExtended, CmsUploadUpdateRequest } from '@/types/uploads';

const uploadEditSchema = z.object({
  title: z.string().max(255, 'Title must be 255 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less'),
  alt_text: z.string().max(255, 'Alt text must be 255 characters or less'),
});

type UploadEditFormValues = z.infer<typeof uploadEditSchema>;

interface UploadEditDialogProps {
  upload: CmsUploadExtended | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (upload: CmsUploadExtended) => void;
}

function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function UploadEditDialog({ upload, open, onOpenChange, onSaved }: UploadEditDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadEditFormValues>({
    resolver: zodResolver(uploadEditSchema),
    defaultValues: {
      title: '',
      description: '',
      alt_text: '',
    },
  });

  useEffect(() => {
    reset({
      title: upload?.title ?? '',
      description: upload?.description ?? '',
      alt_text: upload?.alt_text ?? '',
    });
  }, [upload, reset]);

  async function handleCopyUrl() {
    if (!upload) return;

    try {
      await navigator.clipboard.writeText(upload.public_url);
      toast.success('URL copied to clipboard');
    } catch {
      toast.error('Could not copy URL');
    }
  }

  async function onSubmit(values: UploadEditFormValues) {
    if (!upload) return;

    const payload: CmsUploadUpdateRequest = {
      title: normalizeValue(values.title),
      description: normalizeValue(values.description),
      alt_text: upload.upload_type === 'image' ? normalizeValue(values.alt_text) : null,
    };

    const res = await fetch(`/api/cms/uploads/${upload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message ?? 'Failed to update upload metadata');
    }

    const data = (await res.json().catch(() => null)) as CmsUploadExtended | null;
    const updatedUpload: CmsUploadExtended = {
      ...upload,
      ...payload,
      ...(data ?? {}),
    };

    toast.success('Upload details saved');
    onSaved(updatedUpload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit upload</DialogTitle>
          <DialogDescription>
            Update the metadata shown in the admin library and public resources page.
          </DialogDescription>
        </DialogHeader>

        {upload ? (
          <form
            onSubmit={handleSubmit(async (values) => {
              try {
                await onSubmit(values);
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : 'Failed to update upload metadata',
                );
              }
            })}
            className="space-y-5"
          >
            <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm">
              <div className="grid gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Filename
                </span>
                <span className="break-all">{upload.filename}</span>
              </div>
              <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Content Type
                  </span>
                  <span>{upload.content_type}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Size
                  </span>
                  <span>{formatFileSize(upload.size_bytes)}</span>
                </div>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Public URL
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleCopyUrl}
                  >
                    <Copy className="mr-1 size-3.5" />
                    Copy
                  </Button>
                </div>
                <span className="break-all text-muted-foreground">{upload.public_url}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="upload-title">Title</Label>
              <Input id="upload-title" {...register('title')} placeholder="Optional title" />
              {errors.title ? (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                {...register('description')}
                placeholder="Optional description"
                rows={4}
              />
              {errors.description ? (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              ) : null}
            </div>

            {upload.upload_type === 'image' ? (
              <div className="grid gap-2">
                <Label htmlFor="upload-alt-text">Alt text</Label>
                <Input
                  id="upload-alt-text"
                  {...register('alt_text')}
                  placeholder="Describe the image for accessibility"
                />
                {errors.alt_text ? (
                  <p className="text-sm text-destructive">{errors.alt_text.message}</p>
                ) : null}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
