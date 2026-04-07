'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { navItems } from '@/components/navbar/nav-items';
import DesktopNav from '@/components/navbar/desktop-nav';
import MobileNav from '@/components/navbar/mobile-nav';

export default function Navbar(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const path = usePathname();
  const param = useSearchParams();
  const router = useRouter();

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  const queryParam = param.get('query') ?? '';
  const [query, setQuery] = useState(queryParam);

  // Sync query state from URL params during render instead of via useEffect.
  if (query !== queryParam && queryParam !== '') {
    setQuery(queryParam);
  }

  const handleSearchClicked = (): void => {
    const newParams = new URLSearchParams(param);

    if (query.length > 0) {
      newParams.set('query', query);
    } else {
      newParams.delete('query');
    }

    const searchQuery = newParams.toString();
    router.push(`/blacklist/search${searchQuery ? `?${searchQuery}` : ''}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearchClicked();
    }
  };

  return (
    <header className="w-full">
      <nav className="m-auto flex max-w-7xl flex-row items-center justify-between p-4 sm:p-6 md:px-8 md:py-6">
        <Link
          href="/"
          onClick={handleMenuItemClick}
          className="text-blue-900 font-sans text-4xl font-semibold"
        >
          Specus
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav items={navItems} currentPath={path} />

        {/* Mobile Navigation */}
        <MobileNav
          items={navItems}
          currentPath={path}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      </nav>
    </header>
  );
}
