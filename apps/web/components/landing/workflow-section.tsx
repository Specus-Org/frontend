import type { WorkflowStep } from '@/lib/landing-content';

interface WorkflowSectionProps {
  steps: readonly WorkflowStep[];
}

export function WorkflowSection({ steps }: WorkflowSectionProps): React.ReactElement {
  return (
    <div className="w-full">
      <p className="font-rethink text-2xl font-semibold leading-8 text-foreground text-center mb-6 sm:text-3xl sm:leading-9 sm:mb-8">
        Simple, powerful, and automated procurement intelligence in three steps.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.step}
            className="rounded-xl border border-secondary p-[17px]"
          >
            <p className="text-base font-semibold leading-6 text-[#00adb2] uppercase">
              STEP {i + 1}
            </p>
            <h3 className="mt-2 text-xl font-semibold leading-7 text-foreground">{step.title}</h3>
            <p className="mt-2 text-base leading-6 text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
