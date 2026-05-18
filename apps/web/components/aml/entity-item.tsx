import type { ScreeningSearchResult } from '@specus/api-client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { CountryFlag } from '@/components/aml/country-flag';
import { tryFormatDisplayDate } from '@/lib/date-format';

interface EntityItemProps {
  entity: ScreeningSearchResult;
}

function toDisplayText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function getNationality(entity: ScreeningSearchResult): string | null {
  const nationality = toDisplayText(entity.nationality);
  if (nationality) return nationality;

  const typeFieldNationality = entity.type_fields?.nationality;
  if (typeof typeFieldNationality === 'string') return toDisplayText(typeFieldNationality);
  if (
    typeFieldNationality &&
    typeof typeFieldNationality === 'object' &&
    !Array.isArray(typeFieldNationality)
  ) {
    const nestedNationality = typeFieldNationality as Record<string, unknown>;
    return toDisplayText(nestedNationality.name) ?? toDisplayText(nestedNationality.country);
  }

  return null;
}

function getNationalityCode(entity: ScreeningSearchResult): string | null {
  const nationalityCode = toDisplayText(entity.nationality_code);
  if (nationalityCode) return nationalityCode.toLowerCase();

  const typeFieldNationality = entity.type_fields?.nationality;
  if (
    typeFieldNationality &&
    typeof typeFieldNationality === 'object' &&
    !Array.isArray(typeFieldNationality)
  ) {
    return (
      toDisplayText((typeFieldNationality as Record<string, unknown>).code)?.toLowerCase() ?? null
    );
  }

  return null;
}

function getBirthDate(entity: ScreeningSearchResult): string | null {
  const birthDate =
    toDisplayText(entity.birth_date) ?? toDisplayText(entity.type_fields?.birth_date);
  return birthDate ? (tryFormatDisplayDate(birthDate) ?? birthDate) : null;
}

export function EntityItem({ entity }: EntityItemProps): React.ReactElement {
  const imageSrc =
    entity.entity_type === 'person' ? '/images/img_individual.webp' : '/images/img_company.webp';
  const nationality = getNationality(entity);
  const nationalityCode = getNationalityCode(entity);
  const birthDate = getBirthDate(entity);
  const hasSummary = nationality || birthDate;

  return (
    <Link
      href={`/aml/search/${entity.id}`}
      className="flex w-full min-w-0 items-center gap-3 rounded-2xl bg-slate-50 px-2 py-3 transition-all duration-200 hover:border-gray-200 hover:shadow-md"
    >
      <Image src={imageSrc} alt={entity.caption} width={96} height={96} />

      <div className="mx-3 min-w-0 flex flex-col items-start">
        <h3 className="text-foreground line-clamp-2 break-words text-xl font-semibold">
          {entity.caption}
        </h3>
        {hasSummary && (
          <p className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {nationality && (
              <span className="flex min-w-0 items-center gap-1.5">
                {nationalityCode && (
                  <CountryFlag
                    countryCode={nationalityCode}
                    alt={`${nationality} flag`}
                    size="sm"
                  />
                )}
                <span className="truncate">{nationality}</span>
              </span>
            )}
            {nationality && birthDate && <span aria-hidden="true">·</span>}
            {birthDate && <span>{birthDate}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
