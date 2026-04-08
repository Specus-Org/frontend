'use client';

import { useMemo, useImperativeHandle, forwardRef } from 'react';
import { useEditor } from './use-editor';
import { markdownToEditorJS } from '@/lib/markdown-to-editorjs';
import type { OutputData } from '@editorjs/editorjs';

interface ContentEditorProps {
  value: string | null;
  onChange: (value: string) => void;
}

export interface ContentEditorHandle {
  importMarkdown: (markdown: string) => Promise<void>;
}

export const ContentEditor = forwardRef<ContentEditorHandle, ContentEditorProps>(
  function ContentEditor({ value, onChange }, ref) {
    // Parse initial data once — memoize to avoid re-parsing on every render
    const initialData = useMemo(() => parseBody(value), []);

    const { holderRef, renderData } = useEditor({
      initialData,
      onChange: (data: OutputData) => {
        onChange(JSON.stringify(data));
      },
    });

    useImperativeHandle(ref, () => ({
      async importMarkdown(markdown: string) {
        const data = markdownToEditorJS(markdown);
        await renderData(data);
      },
    }), [renderData]);

    return (
      <div
        ref={holderRef}
        className="min-h-[400px] max-h-[70vh] overflow-y-auto rounded-lg border border-input bg-background pl-10"
      />
    );
  },
);

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
