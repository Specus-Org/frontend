'use client';

import { AmlSearchFilterBar } from '@/components/aml/aml-search-filters';
import SanctionSourcesDialog from '@/components/aml/sanction-sources-dialog';
import type { AmlSearchFilters } from '@/lib/aml-search-params';
import { Button } from '@specus/ui/components/button';
import { Info, Search } from 'lucide-react';

interface AmlSearchCardProps {
  query: string;
  onQueryChange: (value: string) => void;
  filters: AmlSearchFilters;
  onFiltersChange: (value: AmlSearchFilters) => void;
  onSearch: () => void;
  placement: 'landing' | 'results';
  className?: string;
}

export default function AmlSearchCard({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onSearch,
  placement,
  className = '',
}: AmlSearchCardProps): React.ReactNode {
  // A name is always required; the filters only narrow its results.
  const canSearch = query.trim() !== '';

  const searchInput = (
    <div className="relative rounded-xl border bg-white transition-all focus-within:ring">
      <input
        className="placeholder-muted-foreground w-full rounded-xl py-2.5 pr-12 pl-3 text-base font-normal outline-none sm:py-3 sm:pr-14 sm:pl-4 sm:text-lg"
        onInput={(input) => onQueryChange(input.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canSearch) onSearch();
        }}
        value={query}
        placeholder="Search individual or entity name…"
        aria-label="Individual or entity name"
        required
      />

      <Button
        onClick={onSearch}
        disabled={!canSearch}
        aria-label="Search"
        className="bg-brand cursor-pointer hover:bg-brand/90 absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 transition-all duration-200 sm:right-2.5 sm:h-8 sm:w-8 disabled:opacity-50 disabled:cursor-not-allowed"
        data-umami-event="aml_search_button_click"
        data-umami-event-placement={placement}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );

  // On results the filters sit apart from the input as chips; the landing card keeps them inside.
  if (placement === 'results') {
    return (
      <div className={`w-full ${className}`}>
        {searchInput}
        <AmlSearchFilterBar
          variant="chips"
          className="mt-3"
          value={filters}
          onChange={onFiltersChange}
        />
      </div>
    );
  }

  return (
    <div className={`bg-muted w-full rounded-xl ${className}`}>
      {searchInput}
      <AmlSearchFilterBar value={filters} onChange={onFiltersChange} />
      <div className="flex flex-row items-start gap-2 border-t border-slate-200 p-3 sm:items-center">
        <Info className="mt-1 h-4 w-4 shrink-0 text-amber-600 sm:mt-0" />
        <p className="text-sm sm:text-base">
          Results are checked against the available <SanctionSourcesDialog />.
        </p>
      </div>
    </div>
  );
}
