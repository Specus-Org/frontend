import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Paraguay',
  description: 'Paraguay procurement analysis dashboard.',
};

const IFRAME_TITLE = 'Paraguay Procurement Analysis SPECUS Dashboard';

export default function ParaguayPage(): React.ReactNode {
  const dashboardUrl = process.env.NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL;
  if (!dashboardUrl) notFound();

  return (
    <div className="w-full overflow-x-hidden bg-background">
      <iframe
        src={dashboardUrl}
        title={IFRAME_TITLE}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-forms allow-same-origin"
        className="block min-h-[2200px] w-full border-0"
      />
    </div>
  );
}
