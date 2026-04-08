import { cache } from 'react';
import { codeToHtml } from 'shiki';
import { CopyCodeButton } from './copy-code-button';

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
    <div className="group/code relative overflow-hidden rounded-lg">
      {data.language ? (
        <div className="bg-zinc-800 px-4 py-2 text-xs text-zinc-400">
          {data.language}
        </div>
      ) : null}
      <CopyCodeButton code={data.code} />
      {html ? (
        <div
          className="overflow-x-auto text-sm [&_pre]:p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto bg-zinc-900 p-4 text-sm text-zinc-100">
          <code>{data.code}</code>
        </pre>
      )}
    </div>
  );
}
