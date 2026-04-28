'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@specus/ui/components/dialog';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CountryFlag } from './country-flag';
import { listScreeningSources, SanctionsList } from '@specus/api-client';

export default function SanctionSourcesDialog(): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<SanctionsList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);

    listScreeningSources()
      .then((response) => {
        if (!cancelled) {
          setSources(response.data?.sources ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="cursor-pointer text-blue-700 underline underline-offset-4 decoration-blue-700 hover:opacity-95 transition-all">
        sources
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg">Sanction Sources</DialogTitle>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-3 overflow-y-auto pr-1">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-row gap-4 items-center animate-pulse">
                <div className="rounded bg-gray-200 shrink-0" style={{ width: 30, height: 20 }} />
                <div className="h-5 w-48 rounded bg-gray-200" />
              </div>
            ))}

          {error && <p className="text-sm text-red-600">Failed to load sources.</p>}

          {!loading &&
            !error &&
            sources.map((source) => {
              return (
                <div key={source.id} className="flex flex-row gap-4 items-center">
                  <CountryFlag
                    countryCode={source.country_code}
                    authority={source.authority}
                    alt={source.name}
                    size="sm"
                  />

                  {source.source_url ? (
                    <Link
                      href={source.source_url}
                      target="_blank"
                      className="text-blue-700 hover:opacity-95 text-base underline underline-offset-4 decoration-blue-700 py-1 sm:text-lg"
                    >
                      {source.name}
                    </Link>
                  ) : (
                    <span className="text-black text-base py-1 sm:text-lg">{source.name}</span>
                  )}
                </div>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
