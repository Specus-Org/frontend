import type { SanctionsListSummary } from '@specus/api-client';
import { CountryFlag } from '@/components/aml/country-flag';

interface ListedInSectionProps {
  items: SanctionsListSummary[];
}

export function ListedInSection({ items }: ListedInSectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold">Sanction History</h1>
      <div className="flex flex-wrap mt-2 max-w-2xl gap-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-row gap-4 items-start w-full sm:w-1/2">
            <div className="mt-1">
              <CountryFlag
                countryCode={item.country_code}
                authority={item.authority}
                alt={item.name}
                size="sm"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-2">
                <span className="text-base sm:text-xl font-semibold">{item.name}</span>

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.5 2.5H17.5M17.5 2.5V7.5M17.5 2.5L8.33333 11.6667M15 10.8333V15.8333C15 16.2754 14.8244 16.6993 14.5118 17.0118C14.1993 17.3244 13.7754 17.5 13.3333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V6.66667C2.5 6.22464 2.67559 5.80072 2.98816 5.48816C3.30072 5.17559 3.72464 5 4.16667 5H9.16667"
                    stroke="#62748E"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground mt-2">U.S. Department of Treasury</p>
              <span
                className={`mb-1 w-fit rounded-full mt-2 px-2.5 py-0.5 text-xs font-medium text-white bg-destructive`}
              >
                Testing Status
              </span>
              <div className="space-y-2 overflow-hidden mt-2">
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <p className="shrink-0 sm:w-[160px] text-sm text-muted-foreground">Test Key</p>
                  <span className="hidden sm:inline">:</span>
                  <p className="text-sm text-foreground wrap-break-word">Tets Value</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <p className="shrink-0 sm:w-[160px] text-sm text-muted-foreground">Test Key</p>
                  <span className="hidden sm:inline">:</span>
                  <p className="text-sm text-foreground wrap-break-word">Tets Value</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <p className="shrink-0 sm:w-[160px] text-sm text-muted-foreground">Test Key</p>
                  <span className="hidden sm:inline">:</span>
                  <p className="text-sm text-foreground wrap-break-word">Tets Value</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
