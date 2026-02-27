import type { ListedInItem } from '@/data/aml-mock';
import Link from 'next/link';
import { CountryFlag } from '@/components/aml/country-flag';

interface ListedInSectionProps {
  items: ListedInItem[];
}

export function ListedInSection({ items }: ListedInSectionProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold">Listed In</h1>
      <div className="flex flex-wrap mt-2 max-w-2xl gap-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-row gap-4 items-center w-full sm:w-1/2">
            <CountryFlag countryCode={item.country_code} alt={item.label} />

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
  );
}
