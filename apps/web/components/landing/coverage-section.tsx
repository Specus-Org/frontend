import { Bell, Globe2, Layers } from 'lucide-react';

interface CoverageSectionProps {
  trustedSources: readonly string[];
}

export function CoverageSection({ trustedSources }: CoverageSectionProps): React.ReactElement {
  const features = [
    {
      icon: <Layers className="size-4 text-primary" />,
      title: 'Multi-source intelligence',
      bullets: trustedSources as unknown as string[],
    },
    {
      icon: <Globe2 className="size-4 text-primary" />,
      title: 'Global procurement coverage',
      description:
        'Support cross-border procurement reviews with 35+ country coverage, multi-language support, and local compliance context.',
    },
    {
      icon: <Bell className="size-4 text-primary" />,
      title: '24/7 continuous monitoring',
      description:
        'Generate proactive alerts using users and historical records that help you identify and classify sanctions or AML risk signals.',
    },
  ];

  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:px-8">
        <p className="mx-auto max-w-2xl text-center text-base font-medium leading-7 text-foreground">
          End-to-end compliance intelligence tailored to your organization&apos;s procurement needs.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border/60 bg-background p-5"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                {feature.icon}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{feature.title}</h3>
              {feature.bullets ? (
                <ul className="mt-2 space-y-1">
                  {feature.bullets.map((b) => (
                    <li key={b} className="text-xs leading-6 text-muted-foreground">
                      – {b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
