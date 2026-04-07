interface ContentBodyProps {
  body?: string | null;
}

export function ContentBody({ body }: ContentBodyProps) {
  if (!body) {
    return (
      <p className="text-sm text-muted-foreground">No content available.</p>
    );
  }

  return (
    <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
      {body}
    </div>
  );
}
