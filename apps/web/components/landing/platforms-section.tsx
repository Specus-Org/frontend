import { ExternalLink } from 'lucide-react';
import type { Platform } from '@/lib/landing-content';

interface PlatformsSectionProps {
  platforms: readonly Platform[];
}

export function PlatformsSection({ platforms }: PlatformsSectionProps): React.ReactElement {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:px-8">
        <p className="mx-auto max-w-2xl text-center text-base font-medium leading-7 text-foreground">
          Integrated intelligence from three authoritative platforms.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="rounded-xl border border-border/60 bg-background p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{platform.name}</span>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                {platform.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
