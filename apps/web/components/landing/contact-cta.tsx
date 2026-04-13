import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import type { ContactLink } from '@/lib/landing-content';

interface ContactCtaProps {
  slogan: string;
  contactLinks: readonly ContactLink[];
}

export function ContactCta({ slogan, contactLinks }: ContactCtaProps): React.ReactElement {
  const emailLink = contactLinks.find((link) => link.href.startsWith('mailto:'));
  const socialLinks = contactLinks.filter((link) => link !== emailLink);

  return (
    <section className="px-4 sm:px-6 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(145deg,rgba(25,46,73,1),rgba(3,61,139,0.95))] px-6 py-10 text-white shadow-[0_28px_96px_-48px_rgba(25,46,73,0.75)] md:px-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-1">
              Next step
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to bring secure, compliant procurement into one trusted workflow?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-blue-0/88">{slogan}</p>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/8 p-6 backdrop-blur">
            <div className="flex items-center gap-3 text-blue-1">
              <Mail className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.22em]">
                Contact and explore
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {emailLink ? (
                <Button
                  asChild
                  size="lg"
                  className="justify-between rounded-full bg-white text-primary hover:bg-white/90"
                >
                  <Link href={emailLink.href}>
                    Email Specus
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>

            {socialLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-blue-0/82">
                {socialLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer' : undefined}
                    className="underline underline-offset-4 transition hover:text-white"
                  >
                    {link.label} (coming soon)
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
