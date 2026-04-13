import Image from 'next/image';
import {
  buildDetailRows,
  type DetailFieldRow,
  type DetailFieldValue,
} from '@/components/aml/entity-detail-formatters';

interface BiographySectionProps {
  entityType: 'person' | 'organization';
  typeFields?: { [key: string]: unknown };
}

export function BiographySection({ entityType, typeFields }: BiographySectionProps) {
  const imageSrc =
    entityType === 'person' ? '/images/img_individual.webp' : '/images/img_company.webp';

  const entries = buildDetailRows(typeFields);

  return (
    <div>
      <div className="flex flex-col sm:flex-row mt-8 gap-6 justify-start items-start">
        <Image src={imageSrc} width={160} height={160} alt={entityType} />

        <div className="space-y-3 overflow-hidden">
          {entries.map((entry) => (
            <BiographyRow key={entry.key} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BiographyRow({ entry, nested = false }: { entry: DetailFieldRow; nested?: boolean }) {
  if (entry.value.kind === 'text') {
    return (
      <div className="flex flex-col sm:flex-row sm:gap-3">
        <p className={`shrink-0 text-muted-foreground text-base sm:text-lg sm:w-[200px]`}>
          {entry.label}
        </p>
        <span className="hidden sm:inline">:</span>
        <p className={`min-w-0 text-foreground break-words text-base sm:text-lg`}>
          {entry.value.text}
        </p>
      </div>
    );
  }

  return <BiographyGroup label={entry.label} value={entry.value} nested={nested} />;
}

function BiographyGroup({
  label,
  value,
}: {
  label: string;
  value: DetailFieldValue;
  nested: boolean;
}) {
  if (value.kind !== 'group') return null;

  return (
    <div className="space-y-2">
      <p className={`text-muted-foreground text-base sm:text-lg`}>{label}:</p>
      <div className="space-y-2 pl-6">
        {value.rows.map((row) => (
          <BiographyRow key={row.key} entry={row} nested />
        ))}
      </div>
    </div>
  );
}
