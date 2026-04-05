'use client';

import AmlSearchCard from '@/components/aml/aml-search-card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AMLPage(): React.ReactNode {
  const [query, setQuery] = useState('');
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24 md:px-8 md:py-32 lg:py-48">
      <h1 className="text-foreground font-rethink mb-3 text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl">
        Check a Name Against Global Sanctions Lists
      </h1>
      <p className="text-foreground mx-auto max-w-5xl text-base font-normal sm:text-lg md:text-xl lg:text-2xl">
        Enter an individual or entity name to see matches across global sanctions databases.
      </p>

      <AmlSearchCard
        query={query}
        onQueryChange={setQuery}
        onSearch={() => router.push(`/aml/search?q=${encodeURIComponent(query)}`)}
      />
    </div>
  );
}
