import { Activity, BadgeAlert, FileCheck2, GitFork, MapPinned, ShieldAlert } from 'lucide-react';
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
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
        <p className="mx-auto max-w-2xl text-center text-lg font-medium leading-8 text-foreground">
          Each capability is designed to turn fragmented risk checks into a consistent, explainable
          decision workflow.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, index) => {
            const Icon = solutionIcons[index % solutionIcons.length];
            return (
              <div
                key={solution.title}
                className="rounded-xl border border-border/60 bg-background p-5"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <Icon className="size-4" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{solution.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {solution.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-xs leading-6 text-muted-foreground">
                      <span className="mt-2 block size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
