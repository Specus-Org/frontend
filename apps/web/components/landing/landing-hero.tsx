import Link from 'next/link';
import { Button } from '@specus/ui/components/button';

interface LandingHeroProps {
  title: string;
  description: string;
}

export function LandingHero({ title, description }: LandingHeroProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <h1 className="font-rethink text-5xl font-semibold leading-[48px] text-foreground">
        {title}
      </h1>
      <p className="text-2xl leading-8 text-foreground">{description}</p>
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="outline"
          size="default"
          className="rounded-sm border-border px-3 py-2.5 text-sm font-semibold"
        >
          <Link href="mailto:hello@specus.org">Contact us</Link>
        </Button>
        <Button
          asChild
          size="default"
          className="rounded-sm bg-brand px-3 py-2.5 text-sm font-semibold text-slate-50 hover:bg-brand/90"
        >
          <Link href="/aml">Get started</Link>
        </Button>
      </div>
    </div>
  );
}
