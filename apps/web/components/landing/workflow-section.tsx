import { Card, CardContent } from '@specus/ui/components/card';
import type { WorkflowStep } from '@/lib/landing-content';

interface WorkflowSectionProps {
  steps: readonly WorkflowStep[];
}

export function WorkflowSection({ steps }: WorkflowSectionProps): React.ReactElement {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
          Guided workflow
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          How Specus works
        </h2>
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          Screen once, act with context, and monitor continuously with a workflow that moves from
          supplier intake to defensible decision support in a few clear steps.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <Card
            key={step.step}
            className="h-full border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,245,249,0.72))] shadow-[0_20px_52px_-36px_rgba(3,61,139,0.32)]"
          >
            <CardContent className="flex h-full flex-col gap-4 pt-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                Step {step.step}
              </div>
              <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
