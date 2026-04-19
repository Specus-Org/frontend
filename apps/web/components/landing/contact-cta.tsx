import Link from 'next/link';
import { Button } from '@specus/ui/components/button';
import type { ContactLink } from '@/lib/landing-content';

interface ContactCtaProps {
  announcement: string;
  contactLinks: readonly ContactLink[];
}

export function ContactCta({ announcement, contactLinks }: ContactCtaProps): React.ReactElement {
  const emailLink = contactLinks.find((l) => l.href.startsWith('mailto:'));

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 md:px-8">
        <p className="text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
          {announcement}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {emailLink && (
            <Button asChild variant="outline" size="default" className="rounded-full px-5">
              <Link href={emailLink.href}>Contact us</Link>
            </Button>
          )}
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
