import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DashboardEmbed } from '@/components/dashboard-embed';

export const metadata: Metadata = {
  title: 'Indonesia',
  description: 'Indonesia procurement analysis dashboard.',
};

const IFRAME_TITLE = 'Indonesia Procurement Analysis SPECUS Dashboard';

export default function IndonesiaPage(): React.ReactNode {
  const dashboardUrl = process.env.NEXT_PUBLIC_INDONESIA_DASHBOARD_URL;
  if (!dashboardUrl) notFound();

  return <DashboardEmbed src={dashboardUrl} title={IFRAME_TITLE} />;
}
