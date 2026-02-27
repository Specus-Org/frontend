import type { BioDetail } from '@/data/aml-mock';
import Image from 'next/image';

interface BiographySectionProps {
  details: BioDetail[];
}

export function BiographySection({ details }: BiographySectionProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row mt-8 gap-6 justify-start items-start">
        <Image src={'/images/img_individual.webp'} width={160} height={160} alt="Image type" />

        <div className="space-y-3 overflow-hidden">
          {details.map((detail) => (
            <div key={detail.label} className="flex flex-col sm:flex-row sm:gap-2">
              <p className="shrink-0 sm:w-[160px] text-base sm:text-lg text-muted-foreground">{detail.label}</p>
              <span className="hidden sm:inline">:</span>
              <p className="text-base sm:text-lg text-foreground wrap-break-word">{detail.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
