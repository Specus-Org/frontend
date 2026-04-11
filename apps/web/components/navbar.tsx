'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { navItems } from '@/components/navbar/nav-items';
import DesktopNav from '@/components/navbar/desktop-nav';
import MobileNav from '@/components/navbar/mobile-nav';

export default function Navbar(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const path = usePathname();

  const handleMenuItemClick = () => {
    setIsOpen(false);
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
