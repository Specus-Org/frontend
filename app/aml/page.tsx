'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, Search } from 'lucide-react';
import Link from 'next/link';
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
        Enter an individsl or entity name to see matches across global sanctions databases.
      </p>

      {/* Search Card */}
      <div className="bg-muted mx-auto mt-8 w-full max-w-3xl rounded-xl sm:mt-10 md:mt-12">
        <div className="relative rounded-xl border bg-white transition-all focus-within:ring">
          <input
            className="placeholder-muted-foreground w-full rounded-xl px-3 py-2.5 text-base font-normal outline-none sm:px-4 sm:py-3 sm:text-lg"
            onInput={(input) => setQuery(input.currentTarget.value)}
            onKeyDown={() => {}}
            value={query}
            placeholder="Search individual or entity name…"
          />

          <Button
            onClick={() => {
              router.push('/aml/search');
            }}
            className="bg-blue-900 hover:bg-brand/90 absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 transition-all duration-200 sm:right-2.5 sm:h-8 sm:w-8"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-2 p-3 lg:flex-row lg:items-center">
          <Info className="w-4 h-4 text-amber-600" />
          <p>
            Results are checked against the available{' '}
            <Dialog>
              <DialogTrigger className="cursor-pointer text-blue-700 underline underline-offset-4 decoration-blue-700 hover:opacity-95 transition-all">
                sources
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sanction Sources</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex flex-row gap-4 items-center">
                    <picture>
                      <source
                        type="image/webp"
                        srcSet="https://flagcdn.com/h20/id.webp,
                        https://flagcdn.com/h40/id.webp 2x,
                        https://flagcdn.com/h60/id.webp 3x"
                      />
                      <source
                        type="image/png"
                        srcSet="https://flagcdn.com/h20/id.png,
                        https://flagcdn.com/h40/id.png 2x,
                        https://flagcdn.com/h60/id.png 3x"
                      />
                      <img
                        src="https://flagcdn.com/h40/id.png"
                        className="rounded-xs bg-black border"
                        height="20"
                        alt="Ukraine"
                      />
                    </picture>

                    <Link
                      href="https://google.com"
                      target="_blank"
                      className="text-blue-700 hover:opacity-95 text-lg underline underline-offset-4 decoration-blue-700 py-1"
                    >
                      Indonesia List
                    </Link>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
