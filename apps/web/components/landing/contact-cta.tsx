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
    <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
      <p className="font-rethink text-2xl font-semibold leading-8 text-foreground sm:flex-1 sm:text-3xl md:text-4xl md:leading-10">
        {announcement}
      </p>
      <div className="flex shrink-0 items-center gap-4">
        {emailLink && (
          <Button
            asChild
            variant="outline"
            size="default"
            className="rounded-sm border-border px-3 py-2.5 text-sm font-semibold"
          >
            <Link href={emailLink.href}>Contact us</Link>
          </Button>
        )}
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
