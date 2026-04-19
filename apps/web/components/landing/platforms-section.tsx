import { ExternalLink } from 'lucide-react';
import type { Platform } from '@/lib/landing-content';
import Link from 'next/link';

interface PlatformsSectionProps {
  platforms: readonly Platform[];
}

export function PlatformsSection({ platforms }: PlatformsSectionProps): React.ReactElement {
  return (
    <div className="w-full">
      <p className="font-rethink text-2xl font-semibold leading-8 text-foreground text-center mb-6 sm:text-3xl sm:leading-9 sm:mb-8">
        Integrated intelligence from three authoritative platforms.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {platforms.map((platform) => (
          <Link
            key={platform.name}
            href={platform.href ?? '/'}
            target="_blank"
            className="rounded-xl border border-secondary p-[17px]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xl font-semibold leading-7 text-foreground">
                {platform.name}
              </span>
              <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
            <p className="mt-2 text-base leading-6 text-muted-foreground">{platform.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
