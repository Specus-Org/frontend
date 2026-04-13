'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@specus/ui/components/dialog';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { Textarea } from '@specus/ui/components/textarea';
import { Button } from '@specus/ui/components/button';
import { toast } from 'sonner';
import { slugify, SLUG_PATTERN } from '@/lib/slugify';
import type { FooterGroup } from '@/components/footer-groups/types';

interface FooterGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  footerGroup?: FooterGroup | null;
  onSuccess: () => void;
}

export function FooterGroupDialog({
  open,
  onOpenChange,
  footerGroup,
  onSuccess,
}: FooterGroupDialogProps) {
  const isEditing = !!footerGroup;

  const [name, setName] = useState(footerGroup?.name ?? '');
  const [slug, setSlug] = useState(footerGroup?.slug ?? '');
  const [description, setDescription] = useState(
    footerGroup?.description ?? '',
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(value);
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!slug.trim()) {
      nextErrors.slug = 'Slug is required';
    } else if (!SLUG_PATTERN.test(slug)) {
      nextErrors.slug = 'Slug must be lowercase alphanumeric with hyphens';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const body = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
      };

      const url = isEditing
        ? `/api/cms/footer-groups/${footerGroup.id}`
        : '/api/cms/footer-groups';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(data?.message ?? 'Footer group API is not connected yet');
        return;
      }

      toast.success(
        isEditing ? 'Footer group updated' : 'Footer group created',
      );
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Footer Group' : 'Add Footer Group'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="footer-group-name">Name *</Label>
            <Input
              id="footer-group-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Company"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="footer-group-slug">Slug *</Label>
            <Input
              id="footer-group-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="company"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="footer-group-description">Description</Label>
            <Textarea
              id="footer-group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Links shown in the company section of the footer."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : isEditing
                  ? 'Update Footer Group'
                  : 'Create Footer Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
