'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { Textarea } from '@specus/ui/components/textarea';
import { Button } from '@specus/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@specus/ui/components/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@specus/ui/components/tabs';
import { Checkbox } from '@specus/ui/components/checkbox';
import type {
  CmsAuthor,
  CmsCategory,
  CmsTag,
  CmsPageType,
  CmsContentListItem,
} from '@specus/api-client';
import { slugify } from '@/lib/slugify';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const contentFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens',
    ),
  content_type: z.enum(['static_page', 'blog_post', 'flexible_page']),
  body: z.string().nullable().optional(),
  excerpt: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  publish_at: z.string().nullable().optional(),
  author_id: z.string().nullable().optional(),
  category_ids: z.array(z.string()).optional(),
  tag_ids: z.array(z.string()).optional(),
  page_type_id: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
  sort_order: z.coerce.number().int(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  og_image_url: z.string().nullable().optional(),
});

export type ContentFormValues = z.infer<typeof contentFormSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ContentFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<ContentFormValues>;
  onSubmit: (values: ContentFormValues) => Promise<void>;
  isSubmitting: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContentForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
}: ContentFormProps) {
  // Track whether the user has manually edited the slug
  const slugManuallyEdited = useRef(mode === 'edit');

  // Taxonomy data
  const [authors, setAuthors] = useState<CmsAuthor[]>([]);
  const [categories, setCategories] = useState<CmsCategory[]>([]);
  const [tags, setTags] = useState<CmsTag[]>([]);
  const [pageTypes, setPageTypes] = useState<CmsPageType[]>([]);
  const [staticPages, setStaticPages] = useState<CmsContentListItem[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  // Fetch taxonomy data on mount
  useEffect(() => {
    async function fetchTaxonomyData() {
      try {
        const [authorsRes, categoriesRes, tagsRes, pageTypesRes, pagesRes] =
          await Promise.all([
            fetch('/api/cms/authors'),
            fetch('/api/cms/categories'),
            fetch('/api/cms/tags'),
            fetch('/api/cms/page-types'),
            fetch('/api/cms/contents?content_type=static_page&page_size=100'),
          ]);

        if (authorsRes.ok) {
          const data = await authorsRes.json();
          setAuthors(data.items ?? []);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.items ?? []);
        }
        if (tagsRes.ok) {
          const data = await tagsRes.json();
          setTags(data.items ?? []);
        }
        if (pageTypesRes.ok) {
          const data = await pageTypesRes.json();
          setPageTypes(data.items ?? []);
        }
        if (pagesRes.ok) {
          const data = await pagesRes.json();
          setStaticPages(data.items ?? []);
        }
      } catch {
        // Silently fail — dropdowns will just be empty
      } finally {
        setTaxonomyLoading(false);
      }
    }

    fetchTaxonomyData();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      content_type: 'blog_post',
      body: '',
      excerpt: '',
      status: 'draft',
      publish_at: null,
      author_id: null,
      category_ids: [],
      tag_ids: [],
      page_type_id: null,
      parent_id: null,
      sort_order: 0,
      meta_title: '',
      meta_description: '',
      og_image_url: '',
      ...defaultValues,
    },
  });

  const watchedStatus = watch('status');
  const watchedContentType = watch('content_type');

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setValue('title', newTitle, { shouldValidate: true });
    if (!slugManuallyEdited.current) {
      setValue('slug', slugify(newTitle), { shouldValidate: true });
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    slugManuallyEdited.current = true;
    setValue('slug', e.target.value, { shouldValidate: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="main">
        <TabsList>
          <TabsTrigger value="main">Main</TabsTrigger>
          <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        {/* Main tab                                                          */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="main" className="space-y-4 pt-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="content-title">Title *</Label>
            <Input
              id="content-title"
              {...register('title')}
              onChange={handleTitleChange}
              placeholder="Enter a title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="grid gap-2">
            <Label htmlFor="content-slug">Slug *</Label>
            <Input
              id="content-slug"
              {...register('slug')}
              onChange={handleSlugChange}
              placeholder="url-friendly-slug"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Content Type */}
          <div className="grid gap-2">
            <Label htmlFor="content-type">Content Type *</Label>
            <Controller
              name="content_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={mode === 'edit'}
                >
                  <SelectTrigger id="content-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static_page">Static Page</SelectItem>
                    <SelectItem value="blog_post">Blog Post</SelectItem>
                    <SelectItem value="flexible_page">
                      Flexible Page
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">
                Content type cannot be changed after creation.
              </p>
            )}
            {errors.content_type && (
              <p className="text-sm text-destructive">
                {errors.content_type.message}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="grid gap-2">
            <Label htmlFor="content-body">Body</Label>
            <Textarea
              id="content-body"
              {...register('body')}
              placeholder="Write your content here (plain text / markdown)..."
              rows={12}
              className="font-mono text-sm"
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="grid gap-2">
            <Label htmlFor="content-excerpt">Excerpt</Label>
            <Textarea
              id="content-excerpt"
              {...register('excerpt')}
              placeholder="A short summary or excerpt..."
              rows={3}
            />
            {errors.excerpt && (
              <p className="text-sm text-destructive">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="content-status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="content-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-sm text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Publish At (only when scheduled) */}
          {watchedStatus === 'scheduled' && (
            <div className="grid gap-2">
              <Label htmlFor="content-publish-at">Publish At *</Label>
              <Input
                id="content-publish-at"
                type="datetime-local"
                {...register('publish_at')}
              />
              {errors.publish_at && (
                <p className="text-sm text-destructive">
                  {errors.publish_at.message}
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Taxonomy tab                                                      */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="taxonomy" className="space-y-4 pt-4">
          {taxonomyLoading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Loading taxonomy data...</span>
            </div>
          ) : (
            <>
              {/* Author */}
              <div className="grid gap-2">
                <Label htmlFor="content-author">Author</Label>
                <Controller
                  name="author_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? '_none'}
                      onValueChange={(v) =>
                        field.onChange(v === '_none' ? null : v)
                      }
                    >
                      <SelectTrigger id="content-author">
                        <SelectValue placeholder="Select an author" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">None</SelectItem>
                        {authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Categories (multi-select with checkboxes) */}
              <div className="grid gap-2">
                <Label>Categories</Label>
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No categories available.
                  </p>
                ) : (
                  <Controller
                    name="category_ids"
                    control={control}
                    render={({ field }) => (
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                        {categories.map((category) => {
                          const checked = (field.value ?? []).includes(
                            category.id,
                          );
                          return (
                            <label
                              key={category.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(isChecked) => {
                                  const current = field.value ?? [];
                                  if (isChecked) {
                                    field.onChange([...current, category.id]);
                                  } else {
                                    field.onChange(
                                      current.filter(
                                        (id) => id !== category.id,
                                      ),
                                    );
                                  }
                                }}
                              />
                              {category.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  />
                )}
              </div>

              {/* Tags (multi-select with checkboxes) */}
              <div className="grid gap-2">
                <Label>Tags</Label>
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tags available.
                  </p>
                ) : (
                  <Controller
                    name="tag_ids"
                    control={control}
                    render={({ field }) => (
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                        {tags.map((tag) => {
                          const checked = (field.value ?? []).includes(tag.id);
                          return (
                            <label
                              key={tag.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(isChecked) => {
                                  const current = field.value ?? [];
                                  if (isChecked) {
                                    field.onChange([...current, tag.id]);
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== tag.id),
                                    );
                                  }
                                }}
                              />
                              {tag.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  />
                )}
              </div>

              {/* Page Type (only for flexible_page) */}
              {watchedContentType === 'flexible_page' && (
                <div className="grid gap-2">
                  <Label htmlFor="content-page-type">Page Type</Label>
                  <Controller
                    name="page_type_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? '_none'}
                        onValueChange={(v) =>
                          field.onChange(v === '_none' ? null : v)
                        }
                      >
                        <SelectTrigger id="content-page-type">
                          <SelectValue placeholder="Select a page type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          {pageTypes.map((pt) => (
                            <SelectItem key={pt.id} value={pt.id}>
                              {pt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* SEO tab                                                           */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="seo" className="space-y-4 pt-4">
          {/* Meta Title */}
          <div className="grid gap-2">
            <Label htmlFor="content-meta-title">Meta Title</Label>
            <Input
              id="content-meta-title"
              {...register('meta_title')}
              placeholder="SEO title (defaults to content title)"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 50-60 characters.
            </p>
          </div>

          {/* Meta Description */}
          <div className="grid gap-2">
            <Label htmlFor="content-meta-desc">Meta Description</Label>
            <Textarea
              id="content-meta-desc"
              {...register('meta_description')}
              placeholder="SEO description..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 150-160 characters.
            </p>
          </div>

          {/* OG Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="content-og-image">OG Image URL</Label>
            <Input
              id="content-og-image"
              {...register('og_image_url')}
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200 x 630 pixels.
            </p>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Settings tab                                                      */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="settings" className="space-y-4 pt-4">
          {/* Parent (only for static_page) */}
          {watchedContentType === 'static_page' && (
            <div className="grid gap-2">
              <Label htmlFor="content-parent">Parent Page</Label>
              <Controller
                name="parent_id"
                control={control}
                render={({ field }) => {
                  // Filter out the current content from the parent list
                  const filteredPages = defaultValues?.slug
                    ? staticPages.filter(
                        (p) => p.slug !== defaultValues.slug,
                      )
                    : staticPages;

                  return (
                    <Select
                      value={field.value ?? '_none'}
                      onValueChange={(v) =>
                        field.onChange(v === '_none' ? null : v)
                      }
                    >
                      <SelectTrigger id="content-parent">
                        <SelectValue placeholder="No parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">None (top level)</SelectItem>
                        {filteredPages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">
                Organize static pages into a hierarchy.
              </p>
            </div>
          )}

          {/* Sort Order */}
          <div className="grid gap-2">
            <Label htmlFor="content-sort-order">Sort Order</Label>
            <Input
              id="content-sort-order"
              type="number"
              {...register('sort_order')}
              placeholder="0"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first. Default is 0.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Submit */}
      <div className="flex items-center gap-3 border-t pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {mode === 'create' ? 'Create Content' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
