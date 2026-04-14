'use client';

import { useState } from 'react';
import { Copy, ExternalLink, FileText, ImageIcon } from 'lucide-react';
import { Badge } from '@specus/ui/components/badge';
import { Button } from '@specus/ui/components/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@specus/ui/components/card';
import { formatDisplayDate } from '@/lib/date-format';
import type { CmsUploadPublic } from '@/types/uploads';

interface ResourceCardProps {
  upload: CmsUploadPublic;
}

function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceCard({ upload }: ResourceCardProps) {
  const [copied, setCopied] = useState(false);

  const displayName = upload.title?.trim() || upload.filename;
  const isImage = upload.upload_type === 'image';

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(upload.public_url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="h-full overflow-hidden transition-colors hover:border-primary/30">
      {isImage ? (
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={upload.public_url}
            alt={upload.alt_text?.trim() || displayName}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-muted">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-background shadow-sm">
            <FileText className="size-8 text-muted-foreground" />
          </div>
        </div>
      )}

      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="line-clamp-2 text-lg">{displayName}</CardTitle>
            {upload.title && upload.title !== upload.filename ? (
              <p className="line-clamp-1 text-xs text-muted-foreground" title={upload.filename}>
                {upload.filename}
              </p>
            ) : null}
          </div>

          {isImage ? (
            <Badge variant="secondary" className="shrink-0">
              <ImageIcon className="size-3" />
              Image
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              {upload.content_type}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {upload.description ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{upload.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isImage
              ? 'Preview and reuse confirmed image assets from the CMS library.'
              : 'Download and reuse confirmed documents from the CMS library.'}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(upload.size_bytes)}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{formatDisplayDate(upload.created_at)}</span>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a href={upload.public_url} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 size-4" />
            {isImage ? 'Open Image' : 'Open File'}
          </a>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCopyLink}>
          <Copy className="mr-2 size-4" />
          {copied ? 'Copied' : 'Copy Link'}
        </Button>
      </CardFooter>
    </Card>
  );
}
