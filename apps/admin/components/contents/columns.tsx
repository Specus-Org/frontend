'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Badge } from '@specus/ui/components/badge';
import { Button } from '@specus/ui/components/button';
import type { CmsContentListItem } from '@specus/api-client';
import { StatusBadge } from '@/components/contents/status-badge';
import { DataTableRowActions } from '@/components/contents/data-table-row-actions';

const contentTypeLabels: Record<string, string> = {
  static_page: 'Static Page',
  blog_post: 'Blog Post',
  flexible_page: 'Flexible Page',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getColumns(onDeleted: (id: string) => void): ColumnDef<CmsContentListItem>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <Link href={`/contents/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue('title')}
          </Link>
          {row.original.slug && (
            <p className="truncate text-xs text-muted-foreground">/{row.original.slug}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'content_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {contentTypeLabels[row.getValue('content_type') as string] ??
            row.getValue('content_type')}
        </Badge>
      ),
      filterFn: (row, id, value) => value === row.getValue(id),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
      filterFn: (row, id, value) => value === row.getValue(id),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => {
        const author = row.original.author;
        return <span className="text-sm text-muted-foreground">{author?.name ?? '\u2014'}</span>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Updated
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.getValue('updated_at'))}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row.original} onDeleted={onDeleted} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
