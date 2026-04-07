'use client';

import { useMemo } from 'react';
import { useEditor } from './use-editor';
import { markdownToEditorJS } from '@/lib/markdown-to-editorjs';
import type { OutputData } from '@editorjs/editorjs';

interface ContentEditorProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function ContentEditor({ value, onChange }: ContentEditorProps) {
  // Parse initial data once — memoize to avoid re-parsing on every render
  const initialData = useMemo(() => parseBody(value), []);

  const { holderRef } = useEditor({
    initialData,
    onChange: (data: OutputData) => {
      onChange(JSON.stringify(data));
    },
  });

  return (
    <div
      ref={holderRef}
      className="min-h-[400px] rounded-lg border border-input bg-background"
    />
  );
}

function parseBody(value: string | null): OutputData | undefined {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed as OutputData;
    }
  } catch {
    // Not JSON — fall through to markdown conversion
  }

  // Treat as markdown
  return markdownToEditorJS(value);
}
