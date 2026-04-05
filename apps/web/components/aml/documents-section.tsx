import type { DocumentItem } from '@/data/aml-mock';
import { FileText } from 'lucide-react';
import Link from 'next/link';

interface DocumentsSectionProps {
  documents: DocumentItem[];
}

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold">Documents</h1>
      <div className="flex flex-wrap mt-2 max-w-2xl gap-y-3">
        {documents.map((item) => (
          <div key={item.name} className="flex flex-row gap-4 items-center w-full sm:w-1/2">
            <FileText />

            <div>
              <Link
                href={'https://google.com'}
                target="_blank"
                className="text-blue-700 hover:opacity-95 text-lg underline underline-offset-4 decoration-blue-700 py-1"
              >
                {item.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {item.type} • {item.size}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
