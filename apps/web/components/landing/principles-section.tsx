import { Globe2, SearchCheck, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@specus/ui/components/card';
import type { Principle } from '@/lib/landing-content';

const principleIcons = [Shield, Globe2, Sparkles, SearchCheck] as const;

interface PrinciplesSectionProps {
  mission: string;
  vision: string;
  principles: readonly Principle[];
}

export function PrinciplesSection({
  mission,
  vision,
  principles,
}: PrinciplesSectionProps): React.ReactElement {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="rounded-[2rem] border border-border/60 bg-[linear-gradient(145deg,rgba(248,250,252,1),rgba(230,234,239,0.65))] p-8 shadow-[0_24px_80px_-48px_rgba(25,46,73,0.4)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
            Mission and vision
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Procurement intelligence built for trust, not just speed
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">{mission}</p>
          <p className="mt-4 border-l-2 border-primary/30 pl-4 text-sm leading-7 text-foreground/80 sm:text-base">
            {vision}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {principles.map((principle, index) => {
            const Icon = principleIcons[index % principleIcons.length];

            return (
              <Card
                key={principle.name}
                className="h-full border-border/60 bg-background shadow-[0_16px_40px_-28px_rgba(25,46,73,0.28)]"
              >
                <CardHeader className="gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{principle.name}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
