import { Suspense, type ReactNode } from 'react';
import { InfoIcon } from 'lucide-react';

import { ParagraphBlock } from './paragraph-block';
import { HeaderBlock } from './header-block';
import { ListBlock } from './list-block';
import { ImageBlock } from './image-block';
import { QuoteBlock } from './quote-block';
import { TableBlock } from './table-block';
import { DelimiterBlock } from './delimiter-block';
import { WarningBlock } from './warning-block';
import { ChecklistBlock } from './checklist-block';
import { CodeBlock } from './code-block';
import { EmbedBlock } from './embed-block';
import { MermaidBlockWrapper } from './mermaid-block-wrapper';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Block {
  id?: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  tunes?: { textVariant?: string };
}

interface EditorData {
  blocks: Block[];
}

// ---------------------------------------------------------------------------
// Text Variant Tune wrappers
// ---------------------------------------------------------------------------

function CallOutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <InfoIcon className="mt-0.5 size-5 flex-shrink-0 text-primary" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

function CitationWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 text-sm italic text-muted-foreground">{children}</div>
  );
}

function DetailsWrapper({ children }: { children: ReactNode }) {
  return (
    <details className="group my-4 rounded-lg border border-border">
      <summary className="cursor-pointer px-4 py-2 font-medium text-foreground">
        Details
      </summary>
      <div className="border-t border-border px-4 py-3">{children}</div>
    </details>
  );
}

function TuneWrapper({
  variant,
  children,
}: {
  variant: string;
  children: ReactNode;
}) {
  switch (variant) {
    case 'call-out':
      return <CallOutWrapper>{children}</CallOutWrapper>;
    case 'citation':
      return <CitationWrapper>{children}</CitationWrapper>;
    case 'details':
      return <DetailsWrapper>{children}</DetailsWrapper>;
    default:
      return <>{children}</>;
  }
}

// ---------------------------------------------------------------------------
// Block rendering
// ---------------------------------------------------------------------------

function renderBlock(block: Block): ReactNode | null {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock data={block.data} />;
    case 'header':
      return <HeaderBlock data={block.data} />;
    case 'list':
      return <ListBlock data={block.data} />;
    case 'image':
      return <ImageBlock data={block.data} />;
    case 'quote':
      return <QuoteBlock data={block.data} />;
    case 'table':
      return <TableBlock data={block.data} />;
    case 'delimiter':
      return <DelimiterBlock />;
    case 'warning':
      return <WarningBlock data={block.data} />;
    case 'checklist':
      return <ChecklistBlock data={block.data} />;
    case 'code':
      return (
        <Suspense
          fallback={
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          }
        >
          <CodeBlock data={block.data} />
        </Suspense>
      );
    case 'embed':
      return <EmbedBlock data={block.data} />;
    case 'mermaid':
      return <MermaidBlockWrapper data={block.data} />;
    default:
      if (typeof globalThis.console !== 'undefined') {
        console.warn(`[EditorRenderer] Unknown block type: "${block.type}"`);
      }
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

export async function EditorRenderer({ data }: { data: EditorData }) {
  return (
    <div className="space-y-6 text-base leading-relaxed text-foreground">
      {data.blocks.map((block, index) => {
        const content = renderBlock(block);
        if (!content) return null;

        const key = block.id ?? `block-${index}`;

        if (block.tunes?.textVariant) {
          return (
            <TuneWrapper key={key} variant={block.tunes.textVariant}>
              {content}
            </TuneWrapper>
          );
        }

        return <div key={key}>{content}</div>;
      })}
    </div>
  );
}
