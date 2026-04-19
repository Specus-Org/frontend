import Link from 'next/link';
import { Button } from '@specus/ui/components/button';

interface LandingHeroProps {
  title: string;
  description: string;
}

export function LandingHero({ title, description }: LandingHeroProps): React.ReactElement {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24 md:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            variant="outline"
            size="default"
            className="rounded-full px-5"
          >
            <Link href="mailto:hello@specus.org">Contact us</Link>
          </Button>
          <Button
            asChild
            size="default"
            className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
          >
            <Link href="/aml">Get started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
