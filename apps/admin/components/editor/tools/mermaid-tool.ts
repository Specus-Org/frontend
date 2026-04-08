import type { API, BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';
import mermaid from 'mermaid';
import type { MermaidBlockData } from '../types';

// Initialize mermaid once at module level — startOnLoad: false
// prevents mermaid from scanning the DOM on import.
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
});

/** SVG icon for the mermaid toolbox entry (simple flowchart/diagram icon). */
const MERMAID_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5ZM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5ZM9 16a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3ZM7 9v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9M12 13v2"/></svg>';

/** Debounce delay in milliseconds for live preview rendering. */
const DEBOUNCE_MS = 500;

/**
 * Custom Editor.js block tool that renders a Mermaid diagram with a
 * code textarea and debounced live SVG preview.
 *
 * This is a vanilla DOM class — no React, no hooks.
 */
export class MermaidTool implements BlockTool {
  /** Toolbox configuration shown in the Editor.js "+" menu. */
  static get toolbox() {
    return { title: 'Mermaid Diagram', icon: MERMAID_ICON };
  }

  /** Indicates that this tool works in read-only mode. */
  static get isReadOnlySupported() {
    return true;
  }

  /** No paste handling for this block tool. */
  static get pasteConfig() {
    return {};
  }

  private api: API;
  private readOnly: boolean;
  private data: MermaidBlockData;

  private wrapper: HTMLDivElement | null = null;
  private textarea: HTMLTextAreaElement | null = null;
  private preview: HTMLDivElement | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Bound event handlers — stored so they can be removed in destroy(). */
  private handleKeyDown = (e: Event) => e.stopPropagation();
  private handlePaste = (e: Event) => e.stopPropagation();
  private handleInput = () => {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this._renderMermaid(this.textarea?.value ?? '');
    }, DEBOUNCE_MS);
  };

  constructor({ data, api, readOnly }: BlockToolConstructorOptions<MermaidBlockData>) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      code: data?.code ?? '',
    };
  }

  /**
   * Creates the block DOM. Returns the wrapper element synchronously
   * as required by Editor.js.
   */
  render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('mermaid-tool');
    this.wrapper = wrapper;

    if (this.readOnly) {
      // Read-only: only show the preview
      const preview = document.createElement('div');
      preview.classList.add('mermaid-tool__preview');
      this.preview = preview;
      wrapper.appendChild(preview);

      if (this.data.code.trim()) {
        this._renderMermaid(this.data.code);
      } else {
        this._showPlaceholder();
      }

      return wrapper;
    }

    // Editable: split layout with textarea and preview
    const editor = document.createElement('div');
    editor.classList.add('mermaid-tool__editor');

    // Textarea for mermaid code input
    const textarea = document.createElement('textarea');
    textarea.classList.add('mermaid-tool__textarea');
    textarea.placeholder = 'Enter Mermaid diagram syntax...';
    textarea.value = this.data.code;
    this.textarea = textarea;

    // Keyboard / paste isolation — prevents Editor.js from intercepting
    // Enter, Tab, arrow keys, and paste events that belong to the textarea.
    textarea.addEventListener('keydown', this.handleKeyDown);
    textarea.addEventListener('paste', this.handlePaste);
    textarea.addEventListener('input', this.handleInput);

    // Preview pane for rendered SVG
    const preview = document.createElement('div');
    preview.classList.add('mermaid-tool__preview');
    this.preview = preview;

    editor.appendChild(textarea);
    editor.appendChild(preview);
    wrapper.appendChild(editor);

    // Render initial diagram if code is present
    if (this.data.code.trim()) {
      this._renderMermaid(this.data.code);
    } else {
      this._showPlaceholder();
    }

    return wrapper;
  }

  /**
   * Returns the block data to be serialised by Editor.js.
   */
  save(): MermaidBlockData {
    return {
      code: this.textarea ? this.textarea.value : this.data.code,
    };
  }

  /**
   * Validates the block data. Empty mermaid blocks are skipped.
   */
  validate(savedData: MermaidBlockData): boolean {
    return Boolean(savedData.code && savedData.code.trim().length > 0);
  }

  /**
   * Cleans up timers, event listeners, and DOM references.
   */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.textarea) {
      this.textarea.removeEventListener('keydown', this.handleKeyDown);
      this.textarea.removeEventListener('paste', this.handlePaste);
      this.textarea.removeEventListener('input', this.handleInput);
      this.textarea = null;
    }

    this.preview = null;
    this.wrapper = null;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Renders the mermaid diagram code into the preview pane.
   * Uses crypto.randomUUID() for the render ID to avoid collisions
   * when multiple mermaid blocks exist on the page.
   */
  private async _renderMermaid(code: string): Promise<void> {
    if (!this.preview) return;

    if (!code || !code.trim()) {
      this._showPlaceholder();
      return;
    }

    try {
      const id = `mermaid-${crypto.randomUUID()}`;
      const { svg } = await mermaid.render(id, code);
      // Guard: preview may have been destroyed while awaiting render
      if (this.preview) {
        this.preview.innerHTML = svg;
      }
    } catch (error) {
      if (this.preview) {
        const pre = document.createElement('pre');
        pre.classList.add('mermaid-tool__error');
        pre.textContent =
          error instanceof Error ? error.message : 'Failed to render diagram';
        this.preview.innerHTML = '';
        this.preview.appendChild(pre);
      }
    }
  }

  /**
   * Shows a placeholder message in the preview pane when no code is entered.
   */
  private _showPlaceholder(): void {
    if (!this.preview) return;
    const placeholder = document.createElement('span');
    placeholder.classList.add('mermaid-tool__placeholder');
    placeholder.textContent = 'Diagram preview will appear here';
    this.preview.innerHTML = '';
    this.preview.appendChild(placeholder);
  }
}
