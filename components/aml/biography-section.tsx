import Image from 'next/image';

interface BiographySectionProps {
  entityType: 'person' | 'organization';
  typeFields?: { [key: string]: unknown };
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BiographySection({ entityType, typeFields }: BiographySectionProps) {
  const imageSrc =
    entityType === 'person'
      ? '/images/img_individual.webp'
      : '/images/img_company.webp';

  const entries = Object.entries(typeFields ?? {}).filter(
    ([, v]) => v != null && String(v).trim() !== '',
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row mt-8 gap-6 justify-start items-start">
        <Image src={imageSrc} width={160} height={160} alt={entityType} />

        <div className="space-y-3 overflow-hidden">
          {entries.map(([key, value]) => (
            <div key={key} className="flex flex-col sm:flex-row sm:gap-2">
              <p className="shrink-0 sm:w-[160px] text-base sm:text-lg text-muted-foreground">
                {formatLabel(key)}
              </p>
              <span className="hidden sm:inline">:</span>
              <p className="text-base sm:text-lg text-foreground wrap-break-word">
                {String(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
