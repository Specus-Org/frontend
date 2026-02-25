/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

const navItems = [
  {
    labelKey: 'Insights',
    value: 'insight',
    href: '/insight',
  },
  {
    labelKey: 'Profiling',
    value: 'profiling',
    href: '/profiling',
  },
  {
    labelKey: 'AML Screening',
    value: 'aml',
    href: '/aml',
  },
];

export default function Navbar(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const path = usePathname();
  const param = useSearchParams();
  const router = useRouter();

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  const [query, setQuery] = useState('');

  useEffect(() => {
    const queryParam = param.get('query') ?? '';
    setQuery(queryParam);
  }, [param]);

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
        <div className="hidden md:flex flex-row items-center">
          {navItems.map((navigation, index) => (
            <div key={index} className="inline-flex flex-col gap-3">
              <Link
                href={navigation.href}
                className={
                  'text-sm font-medium transition-all px-4 duration-200 hover:cursor-pointer hover:opacity-40'
                }
              >
                {navigation.labelKey}
              </Link>
              <div
                className={`h-0.5 w-full rounded-md ${
                  path === navigation.href ? 'bg-blue-900' : 'bg-transparent'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader className="border-b pb-4">
              <SheetTitle>
                <Image
                  src="/images/img_logo_procurement.webp"
                  width={190}
                  height={56}
                  alt="Lexicon Procurement Logo"
                />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.value}
                  href={item.href}
                  onClick={handleMenuItemClick}
                  className={`hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                    path.startsWith(item.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <span className="text-base font-medium">{item.labelKey}</span>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
