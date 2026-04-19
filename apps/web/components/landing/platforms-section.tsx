import { ExternalLink } from 'lucide-react';

interface Platform {
  name: string;
  description: string;
  href?: string;
}

interface PlatformsSectionProps {
  platforms: readonly Platform[];
}

export function PlatformsSection({ platforms }: PlatformsSectionProps): React.ReactElement {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
        <p className="mx-auto max-w-2xl text-center text-lg font-medium leading-8 text-foreground">
          Integrated intelligence from three authoritative platforms.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {platforms.map((platform) => (
            <div key={platform.name} className="rounded-xl border border-border/60 bg-background p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{platform.name}</span>
                <ExternalLink className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">{platform.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
