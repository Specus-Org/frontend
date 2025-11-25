import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Procure Lens - Procurement Intelligence & Compliance Platform',
  description:
    'Advanced procurement intelligence platform providing sanctions screening, AML compliance, and vendor risk assessment for informed decision-making.',
  generator: 'v0.app',
  keywords: [
    'procurement',
    'sanctions',
    'AML',
    'compliance',
    'vendor intelligence',
    'risk assessment',
  ],
  icons: {
    icon: [
      {
        url: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/favicon/apple-touch-icon.png',
    shortcut: '/favicon/favicon-32x32.png',
  },
  manifest: '/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${inter.className}`}>{children}</body>
    </html>
  );
}
