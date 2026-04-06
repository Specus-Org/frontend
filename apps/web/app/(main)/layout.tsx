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
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <main className="rounded-t-xl rounded-b-xl border-t border-b">{children}</main>
      <Footer />
    </>
  );
}
