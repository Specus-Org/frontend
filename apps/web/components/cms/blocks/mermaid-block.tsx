'use client';

import { useState, useCallback } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
});

interface MermaidData {
  code: string;
}

export function MermaidBlock({ data }: { data: MermaidData }) {
  const [error, setError] = useState<string | null>(null);

  // React 19 ref callback with cleanup — no useEffect
  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      let cancelled = false;

      const renderDiagram = async () => {
        try {
          const id = `mermaid-${crypto.randomUUID()}`;
          const { svg } = await mermaid.render(id, data.code);
          if (!cancelled && node) {
            node.innerHTML = svg;
            setError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : 'Failed to render diagram',
            );
          }
        }
      };

      renderDiagram();

      return () => {
        cancelled = true;
        if (node) node.innerHTML = '';
      };
    },
    [data.code],
  );

  if (error) {
    return (
      <pre className="my-4 rounded-lg bg-muted p-4 text-sm text-destructive">
        {error}
      </pre>
    );
  }

  return <div ref={containerRef} className="my-4 flex justify-center" />;
}
