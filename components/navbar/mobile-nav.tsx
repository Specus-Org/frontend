'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NavItem } from '@/components/navbar/nav-items';

interface MobileNavProps {
  items: NavItem[];
  currentPath: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({ items, currentPath, isOpen, onOpenChange }: MobileNavProps): React.ReactNode {
  const handleMenuItemClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
          {items.map((item) => (
            <Link
              key={item.value}
              href={item.href}
              onClick={handleMenuItemClick}
              className={`hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                currentPath.startsWith(item.href)
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
  );
}
