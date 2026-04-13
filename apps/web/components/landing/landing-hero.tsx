import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { Badge } from '@specus/ui/components/badge';
import type { HeroMetric } from '@/lib/landing-content';

interface LandingHeroProps {
  announcement: string;
  title: string;
  description: string;
  slogan: string;
  metrics: readonly HeroMetric[];
}

export function LandingHero({
  announcement,
  title,
  description,
  slogan,
  metrics,
}: LandingHeroProps): React.ReactElement {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="landing-grid absolute inset-0 opacity-80" aria-hidden="true" />
      <div className="landing-glow absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:py-24">
        <div className="max-w-3xl">
          <Badge variant="outline" className="mb-5 border-primary/20 bg-background/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur">
            <ShieldCheck className="size-3.5" />
            {announcement}
          </Badge>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {description}
          </p>

          <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-foreground/80 sm:text-base">
            {slogan}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 rounded-full px-6 shadow-sm">
              <Link href="/aml">
                Start a Screening
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-primary/20 bg-background/80 px-6">
              <Link href="mailto:hello@specus.org">Contact Specus</Link>
            </Button>
          </div>
        </div>

        <div className="grid w-full max-w-xl gap-4 sm:grid-cols-3 lg:max-w-md lg:grid-cols-1">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-3xl border border-border/60 bg-background/85 p-5 shadow-[0_16px_60px_-32px_rgba(3,61,139,0.35)] backdrop-blur"
            >
              <div className="text-3xl font-semibold tracking-tight text-primary">{metric.value}</div>
              <div className="mt-2 text-sm font-semibold text-foreground">{metric.label}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
