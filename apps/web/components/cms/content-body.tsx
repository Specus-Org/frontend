import { EditorRenderer } from './blocks/editor-renderer';

interface ContentBodyProps {
  body?: string | null;
}

export async function ContentBody({ body }: ContentBodyProps) {
  if (!body) {
    return (
      <p className="text-sm text-muted-foreground">No content available.</p>
    );
  }

  // Try to parse as Editor.js JSON
  try {
    const parsed = JSON.parse(body);
    if (parsed && Array.isArray(parsed.blocks)) {
      return <EditorRenderer data={parsed} />;
    }
  } catch {
    // Not JSON — fall through to plain text
  }

  // Legacy plain text fallback
  return (
    <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
      {body}
    </div>
  );
}
