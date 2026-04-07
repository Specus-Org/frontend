import type { API, BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';
import { EditorState, Compartment, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import type { CodeBlockData, CodeLanguage } from '../types';
import { CODE_LANGUAGES, DEFAULT_LANGUAGE } from '../types';

/**
 * Dynamically loads the CodeMirror language extension for the given language.
 * Uses dynamic imports to code-split language grammars.
 */
async function getLanguageExtension(lang: string): Promise<Extension> {
  switch (lang) {
    case 'javascript':
    case 'typescript': {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript({ jsx: true, typescript: lang === 'typescript' });
    }
    case 'python': {
      const { python } = await import('@codemirror/lang-python');
      return python();
    }
    case 'html': {
      const { html } = await import('@codemirror/lang-html');
      return html();
    }
    case 'css': {
      const { css } = await import('@codemirror/lang-css');
      return css();
    }
    case 'json': {
      const { json } = await import('@codemirror/lang-json');
      return json();
    }
    case 'go': {
      const { go } = await import('@codemirror/lang-go');
      return go();
    }
    case 'sql': {
      const { sql } = await import('@codemirror/lang-sql');
      return sql();
    }
    case 'markdown': {
      const { markdown } = await import('@codemirror/lang-markdown');
      return markdown();
    }
    default:
      return [];
  }
}

/** SVG icon for the code block toolbox entry. */
const CODE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 8-4 4 4 4M17 8l4 4-4 4M14 4l-4 16"/></svg>';

/**
 * Custom Editor.js block tool that renders a code editor powered by
 * CodeMirror 6 with per-block language selection.
 *
 * This is a vanilla DOM class -- no React, no hooks.
 */
export class CodeBlockTool implements BlockTool {
  /** Toolbox configuration shown in the Editor.js "+" menu. */
  static get toolbox() {
    return { title: 'Code', icon: CODE_ICON };
  }

  /** Indicates that this tool works in read-only mode. */
  static get isReadOnlySupported() {
    return true;
  }

  private api: API;
  private readOnly: boolean;
  private data: CodeBlockData;

  private wrapper: HTMLDivElement | null = null;
  private editorView: EditorView | null = null;
  private languageCompartment: Compartment = new Compartment();

  /** Bound event handlers — stored so they can be removed in destroy(). */
  private handleKeyDown = (e: Event) => e.stopPropagation();
  private handlePaste = (e: Event) => e.stopPropagation();

  constructor({ data, api, readOnly }: BlockToolConstructorOptions<CodeBlockData>) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      code: data?.code ?? '',
      language: data?.language ?? DEFAULT_LANGUAGE,
    };
  }

  /**
   * Creates the block DOM and kicks off the async CodeMirror initialisation.
   * Returns the wrapper element synchronously as required by Editor.js.
   */
  render(): HTMLElement {
    // -- wrapper --
    const wrapper = document.createElement('div');
    wrapper.classList.add('code-block-tool');
    this.wrapper = wrapper;

    // Keyboard / paste isolation — prevents Editor.js from intercepting
    // Tab, Enter, arrow keys, and paste events that belong to CodeMirror.
    wrapper.addEventListener('keydown', this.handleKeyDown);
    wrapper.addEventListener('paste', this.handlePaste);

    // -- header (language selector) --
    const header = document.createElement('div');
    header.classList.add('code-block-tool__header');

    const select = document.createElement('select');
    select.classList.add('code-block-tool__select');
    select.disabled = this.readOnly;

    for (const { value, label } of CODE_LANGUAGES) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      if (value === this.data.language) {
        option.selected = true;
      }
      select.appendChild(option);
    }

    select.addEventListener('change', () => {
      this.data.language = select.value as CodeLanguage;
      this._reconfigureLanguage(select.value);
    });

    header.appendChild(select);
    wrapper.appendChild(header);

    // -- editor container --
    const editorContainer = document.createElement('div');
    editorContainer.classList.add('code-block-tool__editor');
    wrapper.appendChild(editorContainer);

    // Initialise CodeMirror asynchronously (language imports are dynamic).
    this._initCodeMirror(editorContainer);

    return wrapper;
  }

  /**
   * Returns the block data to be serialised by Editor.js.
   */
  save(): CodeBlockData {
    return {
      code: this.editorView?.state.doc.toString() ?? this.data.code,
      language: this.data.language,
    };
  }

  /**
   * Validates the block data. Empty code blocks are allowed as placeholders.
   */
  validate(): boolean {
    return true;
  }

  /**
   * Cleans up the CodeMirror instance and event listeners.
   */
  destroy(): void {
    this.editorView?.destroy();
    this.editorView = null;

    if (this.wrapper) {
      this.wrapper.removeEventListener('keydown', this.handleKeyDown);
      this.wrapper.removeEventListener('paste', this.handlePaste);
      this.wrapper = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Creates the CodeMirror 6 editor inside the given container element.
   */
  private async _initCodeMirror(parent: HTMLElement): Promise<void> {
    const langExtension = await getLanguageExtension(this.data.language);

    const extensions: Extension[] = [
      basicSetup,
      this.languageCompartment.of(langExtension),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.data.code = update.state.doc.toString();
        }
      }),
    ];

    if (this.readOnly) {
      extensions.push(EditorView.editable.of(false));
      extensions.push(EditorState.readOnly.of(true));
    }

    const state = EditorState.create({
      doc: this.data.code,
      extensions,
    });

    this.editorView = new EditorView({
      state,
      parent,
    });
  }

  /**
   * Reconfigures the language compartment when the user changes the dropdown.
   */
  private async _reconfigureLanguage(lang: string): Promise<void> {
    if (!this.editorView) return;
    const langExtension = await getLanguageExtension(lang);
    this.editorView.dispatch({
      effects: this.languageCompartment.reconfigure(langExtension),
    });
  }
}
