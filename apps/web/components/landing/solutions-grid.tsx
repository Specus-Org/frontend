import { Activity, AlertTriangle, FileCheck, GitFork, Globe2, ShieldAlert } from 'lucide-react';
import type { Solution } from '@/lib/landing-content';

const solutionIcons = [ShieldAlert, AlertTriangle, GitFork, Activity, FileCheck, Globe2] as const;

interface SolutionsGridProps {
  solutions: readonly Solution[];
}

export function SolutionsGrid({ solutions }: SolutionsGridProps): React.ReactElement {
  return (
    <div className="w-full">
      <p className="font-rethink text-3xl font-semibold leading-9 text-foreground text-center mb-8">
        Each capability is designed to turn fragmented risk checks into a consistent, explainable
        decision workflow.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {solutions.map((solution, index) => {
          const Icon = solutionIcons[index % solutionIcons.length];
          return (
            <div key={solution.title} className="rounded-xl border border-secondary p-[17px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00adb2]/10">
                <Icon className="h-6 w-6 text-[#00adb2]" />
              </div>
              <h3 className="mt-3 text-xl font-semibold leading-7 text-foreground">
                {solution.title}
              </h3>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {solution.bullets.map((bullet) => (
                  <li key={bullet} className="text-base leading-6 text-muted-foreground">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
