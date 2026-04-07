import type { EditorConfig } from '@editorjs/editorjs';
import { createImageUploader } from './image-uploader';
import { CodeBlockTool } from './tools/code-block-tool';
import { MermaidTool } from './tools/mermaid-tool';

type ToolsConfig = NonNullable<EditorConfig['tools']>;

/**
 * Lazily imports and configures all Editor.js plugins.
 * Called from the useEditor hook during initialization to code-split
 * all plugins alongside the core editor.
 */
export async function loadEditorTools(): Promise<{
  tools: ToolsConfig;
  tunes: string[];
}> {
  const [
    { default: Header },
    { default: EditorjsList },
    { default: ImageTool },
    { default: Quote },
    { default: Table },
    { default: Delimiter },
    { default: Warning },
    { default: Checklist },
    { default: InlineCode },
    { default: Marker },
    { default: Underline },
    { default: Embed },
    { default: TextVariantTune },
  ] = await Promise.all([
    import('@editorjs/header'),
    import('@editorjs/list'),
    import('@editorjs/image'),
    import('@editorjs/quote'),
    import('@editorjs/table'),
    import('@editorjs/delimiter'),
    import('@editorjs/warning'),
    import('@editorjs/checklist'),
    import('@editorjs/inline-code'),
    import('@editorjs/marker'),
    import('@editorjs/underline'),
    import('@editorjs/embed'),
    import('@editorjs/text-variant-tune'),
  ]);

  // Cast tools to ToolsConfig — some Editor.js plugin type definitions
  // have constructor signatures that don't perfectly match EditorJS's
  // ToolConstructable/ToolSettings types, but they work correctly at runtime.
  return {
    tools: {
      header: {
        class: Header as any,
        inlineToolbar: true,
        config: {
          levels: [1, 2, 3, 4],
          defaultLevel: 2,
        },
        sanitize: {
          text: {
            b: true,
            i: true,
            u: true,
            a: true,
            mark: true,
            code: true,
          },
        },
      },
      list: {
        class: EditorjsList,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered',
        },
      },
      image: {
        class: ImageTool,
        config: {
          uploader: createImageUploader(),
          features: {
            caption: true,
            border: true,
            stretch: true,
          },
        },
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
      },
      table: {
        class: Table as any,
        inlineToolbar: true,
        config: {
          rows: 2,
          cols: 2,
          withHeadings: false,
          stretched: false,
          maxRows: 50,
          maxCols: 50,
        },
      },
      delimiter: {
        class: Delimiter,
      },
      warning: {
        class: Warning,
        inlineToolbar: true,
        config: {
          titlePlaceholder: 'Title',
          messagePlaceholder: 'Message',
        },
      },
      checklist: {
        class: Checklist,
        inlineToolbar: true,
      },
      inlineCode: {
        class: InlineCode,
      },
      marker: {
        class: Marker,
      },
      underline: {
        class: Underline,
      },
      embed: {
        class: Embed,
        config: {
          services: {
            youtube: true,
            vimeo: true,
            codepen: true,
            github: true,
            figma: true,
          },
        },
      },
      code: {
        class: CodeBlockTool as any,
      },
      mermaid: {
        class: MermaidTool as any,
      },
      textVariant: {
        class: TextVariantTune,
      },
    },
    tunes: ['textVariant'],
  };
}
