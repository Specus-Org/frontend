import Image from 'next/image';

interface NoMatchesSectionProps {
  name: string;
}

export function NoMatchesSection({ name }: NoMatchesSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row mt-8 gap-6 justify-start items-center max-w-3xl">
      <Image src={'/images/img_not_found.webp'} width={160} height={160} alt="Image type" className="shrink-0" />

      <div className="space-y-1 text-center sm:text-left">
        <h3 className="text-lg sm:text-xl font-semibold">No matches found in the screened sources</h3>
        <p className="text-sm">
          &ldquo;{name}&rdquo; was not found on the screened sanctions lists. No further action is
          required based on the current screening results.
        </p>
      </div>
    </div>
  );
}
