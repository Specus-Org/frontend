'use client';

import { useEffect, useState } from 'react';
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
import type { CmsAuthor } from '@specus/api-client';
import { slugify } from '@/lib/slugify';

interface AuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author?: CmsAuthor | null;
  onSuccess: () => void;
}

export function AuthorDialog({
  open,
  onOpenChange,
  author,
  onSuccess,
}: AuthorDialogProps) {
  const isEditing = !!author;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState('{}');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or author changes
  useEffect(() => {
    if (open) {
      setName(author?.name ?? '');
      setSlug(author?.slug ?? '');
      setBio(author?.bio ?? '');
      setAvatarUrl(author?.avatar_url ?? '');
      setSocialLinks(
        author?.social_links
          ? JSON.stringify(author.social_links, null, 2)
          : '{}',
      );
      setSlugManuallyEdited(!!author);
      setErrors({});
    }
  }, [open, author]);

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
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens';
    }

    try {
      JSON.parse(socialLinks);
    } catch {
      newErrors.socialLinks = 'Must be valid JSON';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      let parsedSocialLinks: Record<string, unknown> = {};
      try {
        parsedSocialLinks = JSON.parse(socialLinks);
      } catch {
        // Already validated above
      }

      const body = {
        name: name.trim(),
        slug: slug.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        social_links: parsedSocialLinks,
      };

      const url = isEditing
        ? `/api/cms/authors/${author.id}`
        : '/api/cms/authors';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message ?? 'Something went wrong');
        return;
      }

      toast.success(isEditing ? 'Author updated' : 'Author created');
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
          <DialogTitle>{isEditing ? 'Edit Author' : 'Add Author'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="author-name">Name *</Label>
            <Input
              id="author-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Jane Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="author-slug">Slug *</Label>
            <Input
              id="author-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="jane-doe"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="author-bio">Bio</Label>
            <Textarea
              id="author-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short biography..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="author-avatar">Avatar URL</Label>
            <Input
              id="author-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="author-social">Social Links (JSON)</Label>
            <Textarea
              id="author-social"
              value={socialLinks}
              onChange={(e) => setSocialLinks(e.target.value)}
              placeholder='{"twitter": "https://twitter.com/..."}'
              rows={3}
              className="font-mono text-sm"
            />
            {errors.socialLinks && (
              <p className="text-sm text-destructive">{errors.socialLinks}</p>
            )}
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
                  ? 'Update Author'
                  : 'Create Author'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
