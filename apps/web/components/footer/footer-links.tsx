'use client';

import Link from 'next/link';
import React from 'react';

export default function FooterLinks(): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-12 lg:gap-16">
      {/* Produk column */}
      <div>
        <h3 className="text-foreground mb-3 font-semibold">
          Products
        </h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/blacklist"
              className="text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              Insights
            </Link>
          </li>
          <li>
            <Link
              href="/tender"
              className="text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              Profiling
            </Link>
          </li>
          <li>
            <Link
              href="/tender"
              className="text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              AML Screening
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
