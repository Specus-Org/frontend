import type React from 'react';
import type { Metadata } from 'next';
import { Rethink_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  variable: '--font-rethink-sans',
});

export const metadata: Metadata = {
  title: 'Specus - Procurement Intelligence & Compliance Platform',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${rethinkSans.variable}`}>
        <ThemeProvider defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
          <Navbar />
          <main className="rounded-t-xl rounded-b-xl border-t border-b">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
