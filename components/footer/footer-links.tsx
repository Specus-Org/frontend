'use client';

import Link from 'next/link';
import React from 'react';

const insightItems = [
  { labelKey: 'Bangladesh', value: 'bangladesh', href: '/bangladesh' },
  { labelKey: 'Indonesia', value: 'indonesia', href: '/indonesia' },
  { labelKey: 'Paraguay', value: 'paraguay', href: '/paraguay' },
];

const productItems = [{ labelKey: 'AML Screening', value: 'aml', href: '/aml' }];

function LinkList({ items }: { items: { labelKey: string; value: string; href: string }[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.value}>
          <Link
            href={item.href}
            className="text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {item.labelKey}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function FooterLinks(): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-12 lg:gap-16">
      <div>
        <h3 className="text-foreground mb-3 font-semibold">Insight</h3>
        <LinkList items={insightItems} />
      </div>
      <div>
        <h3 className="text-foreground mb-3 font-semibold">Products</h3>
        <LinkList items={productItems} />
      </div>
    </div>
  );
}
