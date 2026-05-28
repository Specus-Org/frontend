import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DashboardEmbed } from '@/components/dashboard-embed';

export const metadata: Metadata = {
  title: 'Bangladesh',
  description: 'Bangladesh procurement analysis dashboard.',
};

const IFRAME_TITLE = 'Bangladesh Procurement Analysis SPECUS Dashboard';

export default function BangladeshPage(): React.ReactNode {
  const dashboardUrl = process.env.NEXT_PUBLIC_BANGLADESH_DASHBOARD_URL;
  if (!dashboardUrl) notFound();

  return <DashboardEmbed src={dashboardUrl} title={IFRAME_TITLE} />;
}
