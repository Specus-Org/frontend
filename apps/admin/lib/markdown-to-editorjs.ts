import { marked } from 'marked';
import type { Token, Tokens, TokensList } from 'marked';
import type { OutputData } from '@editorjs/editorjs';
import { DEFAULT_LANGUAGE } from '@/components/editor/types';

/**
 * Common language aliases mapped to their canonical names.
 */
const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
};

/**
 * Resolve a fenced code block language string to a canonical language name.
 */
function resolveLanguage(lang: string | undefined): string {
  if (!lang) return DEFAULT_LANGUAGE;
  const lower = lang.toLowerCase().trim();
  return LANGUAGE_ALIASES[lower] ?? lower;
}

/**
 * Render inline markdown formatting to HTML suitable for Editor.js text fields.
 *
 * Converts `**bold**` to `<strong>bold</strong>`, `*italic*` to `<em>italic</em>`,
 * `` `code` `` to `<code>code</code>`, `[link](url)` to `<a href="url">link</a>`, etc.
 */
function renderInline(text: string): string {
  return marked.parseInline(text) as string;
}

// ---------------------------------------------------------------------------
// List item conversion (List 2.0 recursive format)
// ---------------------------------------------------------------------------

interface ListItem {
  content: string;
  meta: Record<string, unknown>;
  items: ListItem[];
}

/**
 * Detect whether a marked list (or any of its nested lists) contains task items.
 */
function listHasTask(list: Tokens.List): boolean {
  return list.items.some((item) => item.task);
}

/**
 * Convert a single marked ListItem token into the Editor.js List 2.0 item format.
 *
 * The item's `.tokens` array may contain a mixture of `text` tokens (the item's
 * own content) and nested `list` tokens (sub-lists). We separate these and
 * recursively convert nested lists into child `items`.
 */
function convertListItem(
  item: Tokens.ListItem,
  isChecklist: boolean,
): ListItem {
  // Collect inline text parts (skip checkbox tokens — their state is in item.checked)
  const textParts: string[] = [];
  const nestedLists: Tokens.List[] = [];

  for (const token of item.tokens) {
    if (token.type === 'list') {
      nestedLists.push(token as Tokens.List);
    } else if (token.type === 'text') {
      textParts.push(renderInline((token as Tokens.Text).text));
    } else if (token.type === 'paragraph') {
      textParts.push(renderInline((token as Tokens.Paragraph).text));
    }
    // checkbox tokens are handled via item.checked — skip them here
  }

  const content = textParts.join('');

  const meta: Record<string, unknown> = {};
  if (isChecklist) {
    meta.checked = item.checked ?? false;
  }

  const children: ListItem[] = [];
  for (const nested of nestedLists) {
    for (const nestedItem of nested.items) {
      children.push(convertListItem(nestedItem, isChecklist));
    }
  }

  return { content, meta, items: children };
}

// ---------------------------------------------------------------------------
// Block conversion
// ---------------------------------------------------------------------------

interface EditorBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

/**
 * Converts a markdown string into Editor.js `OutputData`.
 *
 * Uses `marked.lexer()` to tokenize the markdown, then walks each token and
 * produces the corresponding Editor.js block. This is a pure function with no
 * side effects or DOM access.
 *
 * @example
 * ```ts
 * const data = markdownToEditorJS('# Hello\n\nWorld');
 * // { time: ..., version: '2.31.0', blocks: [
 * //   { id: '1', type: 'header', data: { text: 'Hello', level: 1 } },
 * //   { id: '2', type: 'paragraph', data: { text: 'World' } },
 * // ]}
 * ```
 */
export function markdownToEditorJS(markdown: string): OutputData {
  if (!markdown) {
    return { time: Date.now(), version: '2.31.0', blocks: [] };
  }

  let counter = 0;
  const nextId = (): string => (++counter).toString(36);

  const tokens: TokensList = marked.lexer(markdown);
  const blocks: EditorBlock[] = [];

  for (const token of tokens) {
    const block = convertToken(token, nextId);
    if (block) {
      if (Array.isArray(block)) {
        blocks.push(...block);
      } else {
        blocks.push(block);
      }
    }
  }

  return { time: Date.now(), version: '2.31.0', blocks };
}

/**
 * Convert a single top-level marked token to one or more Editor.js blocks.
 * Returns `null` for tokens that should be skipped (e.g. `space`).
 */
function convertToken(
  token: Token,
  nextId: () => string,
): EditorBlock | EditorBlock[] | null {
  switch (token.type) {
    case 'heading':
      return convertHeading(token as Tokens.Heading, nextId);
    case 'paragraph':
      return convertParagraph(token as Tokens.Paragraph, nextId);
    case 'code':
      return convertCode(token as Tokens.Code, nextId);
    case 'blockquote':
      return convertBlockquote(token as Tokens.Blockquote, nextId);
    case 'list':
      return convertList(token as Tokens.List, nextId);
    case 'table':
      return convertTable(token as Tokens.Table, nextId);
    case 'hr':
      return { id: nextId(), type: 'delimiter', data: {} };
    case 'html':
      return convertHtml(token as Tokens.HTML, nextId);
    case 'space':
      return null;
    default:
      // Unknown token type — skip silently
      return null;
  }
}

// ---------------------------------------------------------------------------
// Individual token converters
// ---------------------------------------------------------------------------

function convertHeading(
  token: Tokens.Heading,
  nextId: () => string,
): EditorBlock {
  return {
    id: nextId(),
    type: 'header',
    data: {
      text: renderInline(token.text),
      level: token.depth,
    },
  };
}

/**
 * Convert a paragraph token. If it contains exactly one image token and
 * nothing else meaningful, promote it to a top-level Image block.
 */
function convertParagraph(
  token: Tokens.Paragraph,
  nextId: () => string,
): EditorBlock {
  // Check for image-only paragraph: exactly one child, and it's an image
  if (token.tokens && token.tokens.length === 1) {
    const child = token.tokens[0];
    if (child.type === 'image') {
      const img = child as Tokens.Image;
      return {
        id: nextId(),
        type: 'image',
        data: {
          file: { url: img.href },
          caption: img.title || img.text || '',
          withBorder: false,
          stretched: false,
          withBackground: false,
        },
      };
    }
  }

  return {
    id: nextId(),
    type: 'paragraph',
    data: {
      text: renderInline(token.text),
    },
  };
}

function convertCode(
  token: Tokens.Code,
  nextId: () => string,
): EditorBlock {
  if (token.lang === 'mermaid') {
    return {
      id: nextId(),
      type: 'mermaid',
      data: { code: token.text },
    };
  }

  return {
    id: nextId(),
    type: 'code',
    data: {
      code: token.text,
      language: resolveLanguage(token.lang),
    },
  };
}

function convertBlockquote(
  token: Tokens.Blockquote,
  nextId: () => string,
): EditorBlock {
  // Extract paragraph tokens from the blockquote's children
  const paragraphs = token.tokens.filter(
    (t): t is Tokens.Paragraph => t.type === 'paragraph',
  );

  const text = paragraphs.length > 0 ? renderInline(paragraphs[0].text) : '';
  const caption =
    paragraphs.length > 1
      ? paragraphs
          .slice(1)
          .map((p) => renderInline(p.text))
          .join('<br>')
      : '';

  return {
    id: nextId(),
    type: 'quote',
    data: { text, caption },
  };
}

function convertList(
  token: Tokens.List,
  nextId: () => string,
): EditorBlock {
  const isChecklist = listHasTask(token);

  let style: string;
  if (isChecklist) {
    style = 'checklist';
  } else if (token.ordered) {
    style = 'ordered';
  } else {
    style = 'unordered';
  }

  const items: ListItem[] = token.items.map((item) =>
    convertListItem(item, isChecklist),
  );

  return {
    id: nextId(),
    type: 'list',
    data: { style, items },
  };
}

function convertTable(
  token: Tokens.Table,
  nextId: () => string,
): EditorBlock {
  const headerRow = token.header.map((cell) => renderInline(cell.text));
  const dataRows = token.rows.map((row) =>
    row.map((cell) => renderInline(cell.text)),
  );

  return {
    id: nextId(),
    type: 'table',
    data: {
      withHeadings: true,
      content: [headerRow, ...dataRows],
    },
  };
}

/**
 * Convert raw HTML blocks to paragraphs. This preserves inline HTML that
 * marked doesn't classify as another block type.
 */
function convertHtml(
  token: Tokens.HTML,
  nextId: () => string,
): EditorBlock | null {
  const trimmed = token.text.trim();
  if (!trimmed) return null;

  return {
    id: nextId(),
    type: 'paragraph',
    data: { text: trimmed },
  };
}
