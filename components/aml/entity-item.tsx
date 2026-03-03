import { formatValue } from '@/lib/utils';
import type { ScreeningSearchResult } from '@/services/generated';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface EntityItemProps {
  entity: ScreeningSearchResult;
}

export function EntityItem({ entity }: EntityItemProps): React.ReactElement {
  const imageSrc =
    entity.entity_type === 'person' ? '/images/img_individual.webp' : '/images/img_company.webp';

  const typeFields = entity.type_fields ?? {};
  const subtitle = Object.values(typeFields)
    .filter((v) => v != null && String(v).trim() !== '')
    .map(formatValue)
    .slice(0, 2)
    .join(' • ');

  return (
    <Link
      href={`/aml/search/${entity.id}`}
      className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-2 py-3 transition-all duration-200 hover:border-gray-200 hover:shadow-md"
    >
      <Image
        src={imageSrc}
        alt={entity.caption}
        width={96}
        height={96}
        className="h-16 w-16 shrink-0 sm:h-24 sm:w-24"
      />

      <div className="mx-2 flex min-w-0 flex-col items-start sm:mx-3">
        <h3 className="text-foreground line-clamp-1 text-base font-semibold sm:text-xl">
          {entity.caption}
        </h3>
        <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">{subtitle}</p>
      </div>
    </Link>
  );
}
