import type React from 'react';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Rethink_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@specus/ui/components/theme-provider';
import { TooltipProvider } from '@specus/ui/components/tooltip';
import { Toaster } from '@specus/ui/components/sonner';

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  variable: '--font-rethink-sans',
});

export const metadata: Metadata = {
  title: 'Specus Admin',
  description: 'Specus administration dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${rethinkSans.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Suspense>{children}</Suspense>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
