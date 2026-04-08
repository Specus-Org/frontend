'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label="Copy code"
      className="absolute right-2 top-2 rounded-md p-1.5 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-700 hover:text-zinc-200 group-hover/code:opacity-100"
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <CheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </button>
  );
}
