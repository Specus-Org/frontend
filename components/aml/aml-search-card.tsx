'use client';

import { Button } from '@/components/ui/button';
import SanctionSourcesDialog from '@/components/aml/sanction-sources-dialog';
import { Info, Search } from 'lucide-react';

interface AmlSearchCardProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}

export default function AmlSearchCard({
  query,
  onQueryChange,
  onSearch,
}: AmlSearchCardProps): React.ReactNode {
  return (
    <div className="bg-muted mx-auto mt-8 w-full max-w-3xl rounded-xl sm:mt-10 md:mt-12">
      <div className="relative rounded-xl border bg-white transition-all focus-within:ring">
        <input
          className="placeholder-muted-foreground w-full rounded-xl px-3 py-2.5 text-base font-normal outline-none sm:px-4 sm:py-3 sm:text-lg"
          onInput={(input) => onQueryChange(input.currentTarget.value)}
          onKeyDown={() => {}}
          value={query}
          placeholder="Search individual or entity name…"
        />

        <Button
          onClick={onSearch}
          className="bg-blue-900 hover:bg-brand/90 absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 transition-all duration-200 sm:right-2.5 sm:h-8 sm:w-8"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-row gap-2 p-3 items-start sm:items-center">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-1 sm:mt-0" />
        <p className="text-sm sm:text-base">
          Results are checked against the available{' '}
          <SanctionSourcesDialog />
          .
        </p>
      </div>
    </div>
  );
}
