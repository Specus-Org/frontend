import Link from 'next/link';
import { Button } from '@specus/ui/components/button';

interface LandingHeroProps {
  title: string;
  description: string;
}

export function LandingHero({ title, description }: LandingHeroProps): React.ReactElement {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 md:px-8 md:py-28">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline" size="lg" className="px-6">
            <Link href="mailto:hello@specus.org">Contact us</Link>
          </Button>
          <Button asChild size="lg" className="bg-foreground px-6 text-background hover:bg-foreground/90">
            <Link href="/aml">Get started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
