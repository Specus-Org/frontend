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
    <div className="flex w-full items-center gap-8">
      <p className="flex-1 font-rethink text-4xl font-semibold leading-10 text-foreground">
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
