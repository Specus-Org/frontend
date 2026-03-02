import type { ScreeningSearchResult } from '@/services/generated';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface EntityItemProps {
  entity: ScreeningSearchResult;
}

export function EntityItem({ entity }: EntityItemProps): React.ReactElement {
  const imageSrc =
    entity.entity_type === 'person'
      ? '/images/img_individual.webp'
      : '/images/img_company.webp';

  const typeFields = entity.type_fields ?? {};
  const subtitle = Object.values(typeFields)
    .filter((v) => v != null && String(v).trim() !== '')
    .map(String)
    .slice(0, 2)
    .join(' • ');

  return (
    <Link
      href={`/aml/search/${entity.id}`}
      className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-2 py-3 transition-all duration-200 hover:border-gray-200 hover:shadow-md"
    >
      <Image src={imageSrc} alt={entity.caption} width={96} height={96} />

      <div className="mx-3 flex flex-col items-start">
        <h3 className="text-foreground line-clamp-1 text-xl font-semibold">{entity.caption}</h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>
    </Link>
  );
}
