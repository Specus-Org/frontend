'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@specus/ui/components/button';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
] as const;

interface ResourceFilterProps {
  uploadType: 'all' | 'image' | 'document';
}

export function ResourceFilter({ uploadType }: ResourceFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleFilterChange(value: 'all' | 'image' | 'document') {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value === 'all') {
      nextParams.delete('upload_type');
    } else {
      nextParams.set('upload_type', value);
    }

    const query = nextParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={uploadType === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange(option.value)}
          aria-pressed={uploadType === option.value}
          disabled={isPending && uploadType === option.value}
        >
          {option.label}
        </Button>
      ))}

      {isPending ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
    </div>
  );
}
