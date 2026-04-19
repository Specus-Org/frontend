import { Platform } from '@/lib/landing-content';
import { Globe2, Radar, ScanSearch } from 'lucide-react';
import Link from 'next/link';

interface CoverageSectionProps {
  trustedSources: readonly Platform[];
}

export function CoverageSection({ trustedSources }: CoverageSectionProps): React.ReactElement {
  const features = [
    {
      Icon: ScanSearch,
      title: 'Multi-source intelligence',
      bullets: trustedSources,
    },
    {
      Icon: Globe2,
      title: 'Global procurement coverage',
      description:
        'Support cross-border procurement reviews with 3+ country coverage, multi-language support, and local compliance context.',
    },
    {
      Icon: Radar,
      title: '24/7 continuous monitoring',
      description:
        'Monitor vendors after onboarding with alerts and historical records that help you identify and classify risk signals.',
    },
  ];

  return (
    <div className="w-full">
      <p className="font-rethink text-3xl font-semibold leading-9 text-foreground text-center mb-8">
        End-to-end compliance intelligence tailored to your organization&apos;s procurement needs.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-secondary p-[17px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00adb2]/10">
              <feature.Icon className="h-6 w-6 text-[#00adb2]" />
            </div>
            <h3 className="mt-3 text-xl font-semibold leading-7 text-foreground">
              {feature.title}
            </h3>
            {feature.bullets ? (
              <ul className="mt-2 list-disc list-inside space-y-1">
                {feature.bullets.map((b) => (
                  <li key={b.name} className="text-base leading-6 text-muted-foreground">
                    <Link
                      className="underline underline-offset-4"
                      target="_blank"
                      href={b.href ?? '/'}
                    >
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-base leading-6 text-muted-foreground">
                {feature.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
