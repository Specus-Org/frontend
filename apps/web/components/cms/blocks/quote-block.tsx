interface QuoteData {
  text: string;
  caption?: string;
  alignment?: string;
}

export function QuoteBlock({ data }: { data: QuoteData }) {
  const alignClass =
    data.alignment === 'center' ? 'text-center' : 'text-left';

  return (
    <blockquote
      className={`border-l-4 border-primary/30 pl-4 italic text-muted-foreground ${alignClass}`}
    >
      <p
        className="text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
      {data.caption ? (
        <cite className="mt-2 block text-sm not-italic text-muted-foreground/70">
          &mdash;{' '}
          <span dangerouslySetInnerHTML={{ __html: data.caption }} />
        </cite>
      ) : null}
    </blockquote>
  );
}
