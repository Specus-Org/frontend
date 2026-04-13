import { Badge } from '@specus/ui/components/badge';
import type { HeroMetric } from '@/lib/landing-content';

interface TrustStripProps {
  metrics: readonly HeroMetric[];
  trustedSources: readonly string[];
}

export function TrustStrip({
  metrics,
  trustedSources,
}: TrustStripProps): React.ReactElement {
  return (
    <section className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
            Trusted data foundation
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Specus combines authoritative intelligence, rapid screening, and audit-ready context so
            procurement teams can move decisively without sacrificing compliance discipline.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {trustedSources.map((source) => (
            <Badge
              key={source}
              variant="outline"
              className="rounded-full border-primary/15 bg-background px-3 py-1 text-xs font-semibold tracking-[0.18em] text-foreground/80 uppercase"
            >
              {source}
            </Badge>
          ))}
          {metrics.map((metric) => (
            <Badge
              key={metric.label}
              variant="secondary"
              className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary"
            >
              {metric.value} {metric.label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
