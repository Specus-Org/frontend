import type { WorkflowStep } from '@/lib/landing-content';

interface WorkflowSectionProps {
  steps: readonly WorkflowStep[];
}

export function WorkflowSection({ steps }: WorkflowSectionProps): React.ReactElement {
  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:px-8">
        <p className="mx-auto max-w-2xl text-center text-base font-medium leading-7 text-foreground">
          Simple, powerful, and automated procurement intelligence in three steps.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="rounded-xl border border-border/60 bg-background p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Step {i + 1}
              </p>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
