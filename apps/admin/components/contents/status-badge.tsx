import { Badge } from '@specus/ui/components/badge';

const statusConfig = {
  draft: {
    label: 'Draft',
    variant: 'secondary' as const,
    className: undefined,
  },
  published: {
    label: 'Published',
    variant: 'default' as const,
    className:
      'border-transparent bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/15',
  },
  scheduled: {
    label: 'Scheduled',
    variant: 'default' as const,
    className:
      'border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/15',
  },
} as const;

interface StatusBadgeProps {
  status: 'draft' | 'published' | 'scheduled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
