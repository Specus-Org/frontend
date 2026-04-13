import { Activity, BadgeAlert, FileCheck2, GitFork, MapPinned, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@specus/ui/components/card';
import type { Solution } from '@/lib/landing-content';

const solutionIcons = [
  ShieldAlert,
  BadgeAlert,
  GitFork,
  Activity,
  FileCheck2,
  MapPinned,
] as const;

interface SolutionsGridProps {
  solutions: readonly Solution[];
}

export function SolutionsGrid({ solutions }: SolutionsGridProps): React.ReactElement {
  return (
    <section className="border-y border-border/60 bg-secondary/35">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
            Core solutions
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Solutions built for modern procurement teams
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Each capability is designed to turn fragmented risk checks into a consistent,
            explainable decision workflow for procurement, compliance, and leadership teams.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {solutions.map((solution, index) => {
            const Icon = solutionIcons[index % solutionIcons.length];

            return (
              <Card
                key={solution.title}
                className="h-full border-border/60 bg-background shadow-[0_20px_48px_-32px_rgba(25,46,73,0.2)]"
              >
                <CardHeader className="gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{solution.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {solution.description}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm leading-6 text-foreground/85">
                    {solution.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
