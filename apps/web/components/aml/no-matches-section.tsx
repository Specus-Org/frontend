import Image from 'next/image';

interface NoMatchesSectionProps {
  name: string;
  /** Whether topic or country filters narrowed the search. */
  filtered?: boolean;
}

function getMessage(name: string, filtered: boolean): { title: string; body: React.ReactNode } {
  if (!filtered) {
    return {
      title: 'No matches found in the screened sources',
      body: (
        <>
          &ldquo;{name}&rdquo; was not found on the screened sanctions lists. No further action is
          required based on the current screening results.
        </>
      ),
    };
  }

  // A filtered search only covers part of the data, so it must not read as a clear result.
  return {
    title: 'No matches found for the selected filters',
    body: (
      <>
        &ldquo;{name}&rdquo; was not found within the selected topics or country. Clear the filters
        to screen the name against all sources.
      </>
    ),
  };
}

export function NoMatchesSection({ name, filtered = false }: NoMatchesSectionProps) {
  const { title, body } = getMessage(name, filtered);

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
        <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
        <p className="max-w-2xl text-sm">{body}</p>
      </div>
    </div>
  );
}
