import type React from 'react';
import { Suspense } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <Navbar />
      </Suspense>
      <main className="flex-1 rounded-t-xl rounded-b-xl border-y">
        {children}
      </main>
      <Footer />
    </div>
  );
}
