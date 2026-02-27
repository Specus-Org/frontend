'use client';

import { BiographySection } from '@/components/aml/biography-section';
import { DocumentsSection } from '@/components/aml/documents-section';
import { ListedInSection } from '@/components/aml/listed-in-section';
import { NoMatchesSection } from '@/components/aml/no-matches-section';
import { SearchResultHeader } from '@/components/aml/search-result-header';
import { Button } from '@/components/ui/button';
import { bio } from '@/data/aml-mock';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function AMLSearchPage(): React.ReactElement {
  const [query, setQuery] = useState('');
  const router = useRouter();

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8">
      <div className="relative rounded-xl border bg-white transition-all focus-within:ring max-w-2xl">
        <input
          className="placeholder-muted-foreground w-full rounded-xl px-3 py-2.5 text-base font-normal outline-none sm:px-4 sm:py-3 sm:text-lg"
          onInput={(input) => setQuery(input.currentTarget.value)}
          onKeyDown={() => {}}
          value={query}
          placeholder="Search individual or entity name…"
        />

        <Button
          onClick={() => {
            router.replace('/aml/search?query=' + query);
          }}
          className="bg-blue-900 hover:bg-brand/90 absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 transition-all duration-200 sm:right-2.5 sm:h-8 sm:w-8"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="py-8 space-y-8 mb-40">
        <SearchResultHeader name={bio.name} status="Not Listed" />
        <BiographySection details={bio.details} />
        <ListedInSection items={bio.listed_in} />
        <DocumentsSection documents={bio.documents} />
        <NoMatchesSection name="Siti Nurhaliza" />
      </div>
    </div>
  );
}
