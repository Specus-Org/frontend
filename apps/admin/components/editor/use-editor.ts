'use client';

import { useRef, useCallback } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import { loadEditorTools } from './plugins';

interface UseEditorOptions {
  initialData?: OutputData;
  onChange: (data: OutputData) => void;
  placeholder?: string;
}

export function useEditor({ initialData, onChange, placeholder }: UseEditorOptions) {
  const editorRef = useRef<EditorJS | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialDataRef = useRef(initialData);
  const placeholderRef = useRef(placeholder ?? 'Start writing...');

  /**
   * Imperatively replace the editor contents. Used by the markdown import
   * dialog to push new blocks without remounting the editor.
   */
  const renderData = useCallback(async (data: OutputData) => {
    if (!editorRef.current) return;
    await editorRef.current.render(data);
    onChangeRef.current(data);
  }, []);

  const isReadyRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Ref callback — React 19 supports returning a cleanup function
  const holderRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      // Guard against double-init (StrictMode)
      if (editorRef.current) return;

      let destroyed = false;

      // Lazy import EditorJS core and all plugins in parallel
      Promise.all([
        import('@editorjs/editorjs'),
        loadEditorTools(),
      ]).then(([{ default: EditorJS }, { tools, tunes }]) => {
        if (destroyed) return;

        const editor = new EditorJS({
          holder: node,
          tools,
          tunes,
          data: initialDataRef.current,
          placeholder: placeholderRef.current,
          onChange: async (api) => {
            if (!isReadyRef.current) return;
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(async () => {
              try {
                const data = await api.saver.save();
                onChangeRef.current(data);
              } catch {
                // Save can fail if editor is being destroyed
              }
            }, 300);
          },
        });

        editorRef.current = editor;

        editor.isReady.then(() => {
          if (!destroyed) {
            isReadyRef.current = true;

            // Initialize undo/redo support
            import('editorjs-undo').then(({ default: Undo }) => {
              if (!destroyed) {
                new Undo({ editor });
              }
            });
          }
        });
      });

      // Cleanup function (React 19 ref callback cleanup)
      return () => {
        destroyed = true;
        clearTimeout(debounceRef.current);
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
        isReadyRef.current = false;
      };
    },
    // Empty deps — initial data and placeholder are captured once on first mount
    // Editor.js is uncontrolled; to reset, unmount and remount via key prop
    [],
  );

  return { holderRef, editorRef, renderData };
}
