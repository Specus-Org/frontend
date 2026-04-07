interface EmbedData {
  service: string;
  source: string;
  embed: string;
  width?: number;
  height?: number;
  caption?: string;
}

export function EmbedBlock({ data }: { data: EmbedData }) {
  const aspectRatio =
    data.width && data.height ? data.height / data.width : 9 / 16;

  return (
    <figure className="my-4">
      <div
        className="relative w-full overflow-hidden rounded-lg"
        style={{ paddingBottom: `${aspectRatio * 100}%` }}
      >
        <iframe
          src={data.embed}
          className="absolute inset-0 size-full"
          allowFullScreen
          loading="lazy"
          title={data.caption || `Embedded content from ${data.service}`}
        />
      </div>
      {data.caption ? (
        <figcaption
          className="mt-2 text-center text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: data.caption }}
        />
      ) : null}
    </figure>
  );
}
