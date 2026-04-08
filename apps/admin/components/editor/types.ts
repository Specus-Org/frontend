import type { OutputData } from '@editorjs/editorjs';

// Re-export for convenience
export type { OutputData };

// Custom block data types for blocks not covered by official plugins
export interface MermaidBlockData {
  code: string;
}

export interface CodeBlockData {
  code: string;
  language: string;
}

// Supported languages for the code block tool
export const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'go', label: 'Go' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]['value'];

export const DEFAULT_LANGUAGE: CodeLanguage = 'javascript';
