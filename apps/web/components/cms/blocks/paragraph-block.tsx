interface ParagraphData {
  text: string;
}

export function ParagraphBlock({ data }: { data: ParagraphData }) {
  return (
    <p
      className="text-base leading-relaxed text-foreground"
      dangerouslySetInnerHTML={{ __html: data.text }}
    />
  );
}
