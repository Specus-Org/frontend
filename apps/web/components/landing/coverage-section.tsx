import { Globe2, Radar, ScanSearch } from 'lucide-react';
import { Badge } from '@specus/ui/components/badge';

interface CoverageSectionProps {
  trustedSources: readonly string[];
}

export function CoverageSection({ trustedSources }: CoverageSectionProps): React.ReactElement {
  return (
    <section className="border-y border-border/60 bg-[linear-gradient(135deg,rgba(25,46,73,1),rgba(3,61,139,0.92))] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:px-8 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-1">
            Data sources and coverage
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A 360-degree view built from multiple authoritative sources
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-blue-0/85">
            Specus combines trusted source data, global coverage, and continuous monitoring so teams
            can move beyond point-in-time screening toward sustained vendor risk awareness.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/15 bg-white/6 p-6 backdrop-blur">
            <ScanSearch className="size-8 text-blue-1" />
            <h3 className="mt-4 text-lg font-semibold">Multi-source intelligence</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {trustedSources.map((source) => (
                <Badge
                  key={source}
                  variant="secondary"
                  className="rounded-full border-0 bg-white/12 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white"
                >
                  {source}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/6 p-6 backdrop-blur">
            <Globe2 className="size-8 text-blue-1" />
            <h3 className="mt-4 text-lg font-semibold">Global procurement coverage</h3>
            <p className="mt-4 text-sm leading-7 text-blue-0/85">
              Support cross-border procurement reviews with 3+ country coverage, multi-language
              support, and local compliance context.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/6 p-6 backdrop-blur">
            <Radar className="size-8 text-blue-1" />
            <h3 className="mt-4 text-lg font-semibold">24/7 continuous monitoring</h3>
            <p className="mt-4 text-sm leading-7 text-blue-0/85">
              Monitor vendors after onboarding with alerts and historical records that help teams
              react to changing sanctions or AML risk signals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
