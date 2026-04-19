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
    <section className="bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 md:px-8 md:py-20">
        <p className="mx-auto max-w-xl text-lg font-medium leading-8 text-foreground">
          {announcement}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {emailLink && (
            <Button asChild variant="outline" size="lg" className="px-6">
              <Link href={emailLink.href}>Contact us</Link>
            </Button>
          )}
          <Button
            asChild
            size="lg"
            className="bg-foreground px-6 text-background hover:bg-foreground/90"
          >
            <Link href="/aml">Get started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
