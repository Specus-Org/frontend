import { cache } from 'react';
import { codeToHtml } from 'shiki';

interface CodeData {
  code: string;
  language?: string;
}

const highlight = cache(async (code: string, lang: string) => {
  try {
    return await codeToHtml(code, {
      lang,
      theme: 'github-dark',
    });
  } catch {
    // Language not supported — return null to trigger fallback
    return null;
  }
});

export async function CodeBlock({ data }: { data: CodeData }) {
  const lang = data.language || 'text';
  const html = await highlight(data.code, lang);

  return (
    <div className="my-4 overflow-hidden rounded-lg">
      {data.language ? (
        <div className="bg-zinc-800 px-4 py-2 text-xs text-zinc-400">
          {data.language}
        </div>
      ) : null}
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="overflow-x-auto bg-zinc-900 p-4 text-sm text-zinc-100">
          <code>{data.code}</code>
        </pre>
      )}
    </div>
  );
}
