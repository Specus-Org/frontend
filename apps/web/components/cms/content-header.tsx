import { Badge } from '@specus/ui/components/badge';

interface ContentHeaderProps {
  title: string;
  publishedAt?: string | null;
  author?: { name: string; slug: string } | null;
  categories?: { name: string; slug: string }[];
  tags?: { name: string; slug: string }[];
}

export function ContentHeader({
  title,
  publishedAt,
  author,
  categories,
  tags,
}: ContentHeaderProps) {
  return (
    <header className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      {(publishedAt || author) ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {publishedAt ? (
            <time dateTime={publishedAt}>
              {new Date(publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          ) : null}
          {publishedAt && author ? (
            <span aria-hidden="true">&middot;</span>
          ) : null}
          {author ? <span>{author.name}</span> : null}
        </div>
      ) : null}

      {(categories && categories.length > 0) ||
        (tags && tags.length > 0) ? (
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <Badge key={category.slug} variant="secondary">
              {category.name}
            </Badge>
          ))}
          {tags?.map((tag) => (
            <Badge key={tag.slug} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </header>
  );
}
