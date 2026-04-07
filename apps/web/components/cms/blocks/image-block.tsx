interface ImageData {
  file: { url: string };
  caption?: string;
  withBorder?: boolean;
  stretched?: boolean;
  withBackground?: boolean;
}

export function ImageBlock({ data }: { data: ImageData }) {
  const containerClasses = [
    'my-4',
    data.withBackground ? 'rounded-lg bg-muted p-4' : '',
    data.stretched ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const imgClasses = [
    'rounded-lg',
    data.withBorder ? 'border border-border' : '',
    data.stretched ? 'w-full' : 'mx-auto',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={containerClasses}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data.file.url}
        alt={data.caption ?? ''}
        className={imgClasses}
        loading="lazy"
      />
      {data.caption ? (
        <figcaption
          className="mt-2 text-center text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: data.caption }}
        />
      ) : null}
    </figure>
  );
}
