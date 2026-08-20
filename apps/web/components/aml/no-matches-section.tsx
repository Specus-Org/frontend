import Image from 'next/image';

interface NoMatchesSectionProps {
  name: string;
}

export function NoMatchesSection({ name }: NoMatchesSectionProps) {
  return (
    <div className="mt-8 flex w-full flex-col items-center justify-start gap-6 sm:flex-row">
      <Image
        src={'/images/img_not_found.webp'}
        width={160}
        height={160}
        alt="Image type"
        className="shrink-0"
      />

      <div className="space-y-1 text-center sm:text-left">
        <h3 className="text-lg font-semibold sm:text-xl">
          No matches found in the screened sources
        </h3>
        <p className="max-w-2xl text-sm">
          &ldquo;{name}&rdquo; was not found on the screened sanctions lists. No further action is
          required based on the current screening results.
        </p>
      </div>
    </div>
  );
}
