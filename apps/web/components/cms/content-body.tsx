import { EditorRenderer } from './blocks/editor-renderer';

interface ContentBodyProps {
  body?: string | null;
}

interface ParsedEditorBlock {
  id?: string;
  type: string;
  data: unknown;
  tunes?: { textVariant?: string };
}

interface ParsedEditorData {
  blocks: ParsedEditorBlock[];
}

export async function ContentBody({ body }: ContentBodyProps) {
  if (!body) {
    return (
      <p className="text-sm text-muted-foreground">No content available.</p>
    );
  }

  const editorData = parseEditorData(body);
  if (editorData) {
    return <EditorRenderer data={editorData} />;
  }

  // Legacy plain text fallback
  return (
    <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
      {body}
    </div>
  );
}

function parseEditorData(body: string): ParsedEditorData | null {
  try {
    const parsed = JSON.parse(body);
    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed as ParsedEditorData;
    }
  } catch {
    // Not JSON — fall through to plain text
  }

  return null;
}
