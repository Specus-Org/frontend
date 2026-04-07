import type { CmsContentListItem } from '@specus/api-client';
import { Badge } from '@specus/ui/components/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@specus/ui/components/card';
import Link from 'next/link';

interface BlogCardProps {
  post: CmsContentListItem;
}

export function BlogCard({ post }: BlogCardProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="h-full transition-colors hover:border-primary/30">
        <CardHeader>
          <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
        </CardHeader>

        {post.excerpt && (
          <CardContent>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          </CardContent>
        )}

        <CardFooter className="mt-auto flex-col items-start gap-3">
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.categories.map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
            {post.author && <span>{post.author.name}</span>}
            {post.author && publishedDate && (
              <span aria-hidden="true">&middot;</span>
            )}
            {publishedDate && <time dateTime={post.published_at!}>{publishedDate}</time>}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
