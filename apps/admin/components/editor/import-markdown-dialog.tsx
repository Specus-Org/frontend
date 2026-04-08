'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { Textarea } from '@specus/ui/components/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@specus/ui/components/dialog';

interface ImportMarkdownDialogProps {
  onImport: (markdown: string) => void;
}

export function ImportMarkdownDialog({ onImport }: ImportMarkdownDialogProps) {
  const [markdown, setMarkdown] = useState('');
  const [open, setOpen] = useState(false);

  function handleImport() {
    if (!markdown.trim()) return;
    onImport(markdown);
    setMarkdown('');
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setMarkdown('');
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <FileText className="mr-1.5 size-3.5" />
          Import Markdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Markdown</DialogTitle>
          <DialogDescription>
            Paste raw markdown below. It will be converted to Editor.js blocks
            and replace the current editor content.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder={"# My Article\n\nWrite your markdown here...\n\n- Headings, lists, code blocks\n- Tables, images, blockquotes\n- Mermaid diagrams (```mermaid)"}
          className="min-h-[200px] max-h-[50vh] flex-1 resize-none font-mono text-sm"
        />

        <p className="text-xs text-muted-foreground">
          Supports: headings, paragraphs, lists (ordered, unordered, checklists),
          code blocks, mermaid diagrams, tables, images, blockquotes, horizontal rules,
          math blocks ($$...$$), inline math ($...$), footnotes ([^1]), and
          GitHub admonitions (&gt; [!NOTE], [!WARNING], [!TIP], [!IMPORTANT], [!CAUTION]).
        </p>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!markdown.trim()}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
