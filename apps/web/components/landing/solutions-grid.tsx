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
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:px-8">
        <p className="mx-auto max-w-2xl text-center text-base font-medium leading-7 text-foreground">
          Each capability is designed to turn fragmented risk checks into a consistent, explainable
          decision workflow.
        </p>

        <div className="mt-10 grid gap-px rounded-xl border border-border/60 bg-border/60 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, index) => {
            const Icon = solutionIcons[index % solutionIcons.length];
            return (
              <div key={solution.title} className="bg-background p-5">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{solution.title}</h3>
                <ul className="mt-2 space-y-1">
                  {solution.bullets.map((bullet) => (
                    <li key={bullet} className="text-xs leading-6 text-muted-foreground">
                      – {bullet}
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
