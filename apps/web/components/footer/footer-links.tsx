'use client';

import Link from 'next/link';
import React from 'react';
import type { FooterLinkGroup } from './footer-link-groups';

interface FooterLinksProps {
  groups: FooterLinkGroup[];
}

const linkClassName =
  'text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors';

export default function FooterLinks({ groups }: FooterLinksProps): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-12 lg:gap-16">
      {/* Produk column */}
      <div>
        <h3 className="text-foreground mb-3 font-semibold">Products</h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/bangladesh"
              className={linkClassName}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Bangladesh
            </Link>
          </li>
          <li>
            <Link
              href="/indonesia"
              className={linkClassName}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Indonesia
            </Link>
          </li>
          <li>
            <Link
              href="/paraguay"
              className={linkClassName}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Paraguay
            </Link>
          </li>
          <li>
            <Link
              href="/aml"
              className={linkClassName}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              AML Screening
            </Link>
          </li>
        </ul>
      </div>

      {groups.map((group) => (
        <div key={group.id}>
          <h3 className="text-foreground mb-3 font-semibold">{group.name}</h3>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.urlPath}
                  className={linkClassName}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
