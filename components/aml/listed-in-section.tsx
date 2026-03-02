import type { SanctionsListSummary } from '@/services/generated';
import { CountryFlag } from '@/components/aml/country-flag';

interface ListedInSectionProps {
  items: SanctionsListSummary[];
}

export function ListedInSection({ items }: ListedInSectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold">Listed In</h1>
      <div className="flex flex-wrap mt-2 max-w-2xl gap-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-row gap-4 items-center w-full sm:w-1/2">
            <CountryFlag countryCode={item.country_code} alt={item.name} />
            <span className="text-lg py-1">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
