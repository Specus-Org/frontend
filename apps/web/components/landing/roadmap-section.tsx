import { Card, CardContent, CardHeader } from '@specus/ui/components/card';
import type { RoadmapQuarter } from '@/lib/landing-content';

interface RoadmapSectionProps {
  roadmap: readonly RoadmapQuarter[];
}

export function RoadmapSection({ roadmap }: RoadmapSectionProps): React.ReactElement {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
            Company momentum
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            2026 roadmap
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            A visible product and company trajectory that expands Specus from core compliance
            workflows into broader procurement intelligence, integrations, and AI-assisted decision
            support.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-4">
        {roadmap.map((quarter) => (
          <Card
            key={quarter.quarter}
            className="h-full border-border/60 bg-background shadow-[0_18px_44px_-30px_rgba(25,46,73,0.24)]"
          >
            <CardHeader className="gap-3">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                {quarter.quarter}
              </div>
              <h3 className="text-xl font-semibold leading-8 text-foreground">{quarter.focus}</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {quarter.milestones.map((milestone) => (
                  <li key={milestone} className="flex items-start gap-3">
                    <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{milestone}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
