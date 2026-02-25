'use client';

import { Button } from '@/components/ui/button';
import { FileText, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const bio = {
  name: 'Ahmad Hidayat',
  details: [
    {
      label: 'Gender',
      value: 'Male',
    },
    {
      label: 'Born',
      value: 'June 28, 1977, Serawak, Malaysia',
    },
    {
      label: 'Alias',
      value: 'Taufik, Dayat, Ahmad Taufik',
    },
    {
      label: 'Nationality',
      value: 'Malaysia',
    },
    {
      label: 'Last Seen',
      value: 'Brunei Darussalam',
    },
  ],
  listed_in: [
    {
      country_code: 'in',
      label: 'Indonesia',
      source: 'https://google.com',
    },
    {
      country_code: 'cn',
      label: 'China',
      source: 'https://google.com',
    },
    {
      country_code: 'un',
      label: 'UN Consolidated List',
      source: 'https://google.com',
    },
    {
      country_code: 'eu',
      label: 'EEAS Sanction List',
      source: 'https://google.com',
    },
  ],
  documents: [
    {
      name: 'Arrest Warrant',
      type: 'PDF',
      size: '2.3 MB',
    },
    {
      name: 'Westing Order',
      type: 'PDF',
      size: '2.3 MB',
    },
  ],
};

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
        <div>
          <h1 className="text-3xl font-semibold">{bio.name}</h1>
          <span
            className={`mb-1 w-fit rounded-full mt-2 px-2.5 py-0.5 text-xs font-medium text-white bg-destructive`}
          >
            Not Listed
          </span>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row mt-8 gap-6 justify-start items-start">
            <Image src={'/images/img_individual.webp'} width={160} height={160} alt="Image type" />

            <div className="space-y-3 overflow-hidden">
              {bio.details.map((detail) => (
                <div key={detail.label} className="flex flex-col sm:flex-row sm:gap-2">
                  <p className="shrink-0 sm:w-[160px] text-base sm:text-lg text-muted-foreground">{detail.label}</p>
                  <span className="hidden sm:inline">:</span>
                  <p className="text-base sm:text-lg text-foreground wrap-break-word">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold">Listed In</h1>
          <div className="flex flex-wrap mt-2 max-w-2xl gap-y-3">
            {bio.listed_in.map((item) => (
              <div key={item.label} className="flex flex-row gap-4 items-center w-full sm:w-1/2">
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`https://flagcdn.com/h20/${item.country_code}.webp,
                          https://flagcdn.com/h40/${item.country_code}.webp 2x,
                          https://flagcdn.com/h60/${item.country_code}.webp 3x`}
                  />
                  <source
                    type="image/png"
                    srcSet={`https://flagcdn.com/h20/${item.country_code}.png,
                          https://flagcdn.com/h40/${item.country_code}.png 2x,
                          https://flagcdn.com/h60/${item.country_code}.png 3x`}
                  />
                  <img
                    src={`https://flagcdn.com/h40/${item.country_code}.png`}
                    className="rounded-sm bg-black border"
                    height="20"
                    alt={item.label}
                  />
                </picture>

                <Link
                  href={item.source}
                  target="_blank"
                  className="text-blue-700 hover:opacity-95 text-lg underline underline-offset-4 decoration-blue-700 py-1"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold">Documents</h1>
          <div className="flex flex-wrap mt-2 max-w-2xl gap-y-3">
            {bio.documents.map((item) => (
              <div key={item.name} className="flex flex-row gap-4 items-center w-full sm:w-1/2">
                <FileText />

                <div>
                  <Link
                    href={'https://google.com'}
                    target="_blank"
                    className="text-blue-700 hover:opacity-95 text-lg underline underline-offset-4 decoration-blue-700 py-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {item.type} • {item.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row mt-8 gap-6 justify-start items-center max-w-3xl">
          <Image src={'/images/img_not_found.webp'} width={160} height={160} alt="Image type" className="shrink-0" />

          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-semibold">No matches found in the screened sources</h3>
            <p className="text-sm">
              “Siti Nurhaliza” was not found on the screened sanctions lists. No further action is
              required based on the current screening results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
