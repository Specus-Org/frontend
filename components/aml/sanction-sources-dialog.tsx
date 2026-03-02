'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { listScreeningSources } from '@/services/generated';
import type { SanctionsList } from '@/services/generated';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SanctionSourcesDialog(): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<SanctionsList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sanction Sources</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-6">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-row gap-4 items-center animate-pulse">
                <div className="h-5 w-8 rounded bg-gray-200" />
                <div className="h-5 w-48 rounded bg-gray-200" />
              </div>
            ))}

          {error && (
            <p className="text-sm text-red-600">Failed to load sources.</p>
          )}

          {!loading &&
            !error &&
            sources.map((source) => {
              const code = source.country_code.toLowerCase();
              return (
                <div key={source.id} className="flex flex-row gap-4 items-center">
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={`https://flagcdn.com/h20/${code}.webp, https://flagcdn.com/h40/${code}.webp 2x, https://flagcdn.com/h60/${code}.webp 3x`}
                    />
                    <source
                      type="image/png"
                      srcSet={`https://flagcdn.com/h20/${code}.png, https://flagcdn.com/h40/${code}.png 2x, https://flagcdn.com/h60/${code}.png 3x`}
                    />
                    <img
                      src={`https://flagcdn.com/h40/${code}.png`}
                      className="rounded-xs bg-black border"
                      height="20"
                      alt={source.name}
                    />
                  </picture>

                  {source.source_url ? (
                    <Link
                      href={source.source_url}
                      target="_blank"
                      className="text-blue-700 hover:opacity-95 text-lg underline underline-offset-4 decoration-blue-700 py-1"
                    >
                      {source.name}
                    </Link>
                  ) : (
                    <span className="text-black text-lg py-1">
                      {source.name}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
