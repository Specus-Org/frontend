// Type declarations for Editor.js plugins that don't ship their own types
// or have broken package.json "exports" preventing type resolution.

declare module '@editorjs/checklist' {
  import type { BlockToolConstructable } from '@editorjs/editorjs';
  const Checklist: BlockToolConstructable;
  export default Checklist;
}

declare module '@editorjs/marker' {
  import type { InlineToolConstructable } from '@editorjs/editorjs';
  const Marker: InlineToolConstructable;
  export default Marker;
}

declare module '@editorjs/embed' {
  import type { BlockToolConstructable } from '@editorjs/editorjs';
  const Embed: BlockToolConstructable;
  export default Embed;
}

declare module '@editorjs/text-variant-tune' {
  import type { BlockTuneConstructable } from '@editorjs/editorjs';
  const TextVariantTune: BlockTuneConstructable;
  export default TextVariantTune;
}

declare module 'editorjs-undo' {
  import type EditorJS from '@editorjs/editorjs';

  interface UndoConfig {
    editor: EditorJS;
    maxLength?: number;
    onUpdate?: () => void;
  }

  class Undo {
    constructor(config: UndoConfig);
  }

  export default Undo;
}
