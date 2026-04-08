import { Badge } from '@specus/ui/components/badge';

interface PageHeaderProps {
  title: string;
  categories?: { name: string; slug: string }[];
  tags?: { name: string; slug: string }[];
}

export function PageHeader({ title, categories, tags }: PageHeaderProps) {
  return (
    <header className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>

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
