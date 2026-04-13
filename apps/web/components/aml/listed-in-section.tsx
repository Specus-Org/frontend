import Link from 'next/link';
import type { EntitySanction } from '@specus/api-client';
import { CountryFlag } from '@/components/aml/country-flag';
import { buildSanctionRows, getSanctionLink } from '@/components/aml/entity-detail-formatters';

interface ListedInSectionProps {
  items: EntitySanction[];
}

export function ListedInSection({ items }: ListedInSectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold">Sanction History</h1>
      <div className="flex flex-wrap mt-2 gap-y-3">
        {items.map((item, index) => {
          const sanctionRows = buildSanctionRows(item);
          const sanctionLink = getSanctionLink(item);
          const summary = item.sanctions_list;
          const title = summary?.name ?? `Sanction Entry ${index + 1}`;

          return (
            <div key={`${title}-${index}`} className="flex flex-row gap-4 items-start w-full">
              {summary ? (
                <div className="mt-1">
                  <CountryFlag
                    countryCode={summary.country_code}
                    authority={summary.authority}
                    alt={summary.name}
                    size="sm"
                  />
                </div>
              ) : null}

              <div className="flex flex-col min-w-0">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-base sm:text-xl font-semibold">{title}</span>

                  {sanctionLink ? (
                    <Link
                      href={sanctionLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open source"
                      className="shrink-0 text-muted-foreground"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.5 2.5H17.5M17.5 2.5V7.5M17.5 2.5L8.33333 11.6667M15 10.8333V15.8333C15 16.2754 14.8244 16.6993 14.5118 17.0118C14.1993 17.3244 13.7754 17.5 13.3333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V6.66667C2.5 6.22464 2.67559 5.80072 2.98816 5.48816C3.30072 5.17559 3.72464 5 4.16667 5H9.16667"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  ) : null}
                </div>

                {summary?.authority ? (
                  <p className="text-muted-foreground mt-2">{summary.authority}</p>
                ) : null}

                {item.is_active && (
                  <span className="mb-1 w-fit rounded-full mt-2 px-2.5 py-0.5 text-xs font-medium text-destructive border-destructive border bg-destructive/5">
                    Active
                  </span>
                )}

                {sanctionRows.length > 0 ? (
                  <div className="space-y-2 overflow-hidden mt-2">
                    {sanctionRows.map((row) => (
                      <div key={row.label} className="flex flex-col sm:flex-row sm:gap-2">
                        <p className="shrink-0 sm:w-[160px] text-sm text-muted-foreground">
                          {row.label}
                        </p>
                        <span className="hidden sm:inline">:</span>
                        <p className="text-sm text-foreground break-words">{row.value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
