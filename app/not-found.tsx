'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative">
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
            <FileQuestion className="size-10 text-primary" />
          </div>

          <h1 className="mb-2 text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
            404
          </h1>

          <p className="mb-2 text-2xl font-semibold text-foreground">Page not found</p>

          <p className="mb-8 max-w-md text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Check the URL or
            navigate back to the homepage.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Need help?</span>
        <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
          Contact us
        </Link>
      </div>
    </div>
  );
}
