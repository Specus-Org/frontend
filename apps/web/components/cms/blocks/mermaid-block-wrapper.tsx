'use client';

import dynamic from 'next/dynamic';

const MermaidBlock = dynamic(
  () => import('./mermaid-block').then((m) => m.MermaidBlock),
  {
    ssr: false,
    loading: () => (
      <div className="my-4 h-32 animate-pulse rounded-lg bg-muted" />
    ),
  },
);

export function MermaidBlockWrapper({ data }: { data: { code: string } }) {
  return <MermaidBlock data={data} />;
}
