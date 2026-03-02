'use client';

import Link from 'next/link';
import React from 'react';
import { navItems } from '@/components/navbar/nav-items';

export default function FooterLinks(): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-12 lg:gap-16">
      <div>
        <h3 className="text-foreground mb-3 font-semibold">
          Products
        </h3>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.value}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors"
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              >
                {item.labelKey}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
