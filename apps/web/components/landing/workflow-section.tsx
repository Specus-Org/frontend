import type { WorkflowStep } from '@/lib/landing-content';

interface WorkflowSectionProps {
  steps: readonly WorkflowStep[];
}

export function WorkflowSection({ steps }: WorkflowSectionProps): React.ReactElement {
  return (
    <div className="w-full">
      <p className="font-rethink text-3xl font-semibold leading-9 text-foreground text-center mb-8">
        Simple, powerful, and automated procurement intelligence in three steps.
      </p>
      <div className="grid grid-cols-3 gap-4">
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
