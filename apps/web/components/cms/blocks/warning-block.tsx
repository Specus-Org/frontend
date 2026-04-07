import { AlertTriangleIcon } from 'lucide-react';

interface WarningData {
  title: string;
  message: string;
}

export function WarningBlock({ data }: { data: WarningData }) {
  return (
    <div className="my-4 rounded-lg border border-amber-300/50 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/20">
      <div className="flex items-start gap-3 p-4">
        <AlertTriangleIcon className="mt-0.5 size-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p
            className="font-semibold text-amber-900 dark:text-amber-200"
            dangerouslySetInnerHTML={{ __html: data.title }}
          />
          <p
            className="text-sm text-amber-800 dark:text-amber-300"
            dangerouslySetInnerHTML={{ __html: data.message }}
          />
        </div>
      </div>
    </div>
  );
}
