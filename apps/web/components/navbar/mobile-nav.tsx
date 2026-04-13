'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@specus/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@specus/ui/components/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@specus/ui/components/avatar';
import { NavItem } from '@/components/navbar/nav-items';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name[0]?.toUpperCase() ?? '?';
}

interface MobileNavProps {
  items: NavItem[];
  currentPath: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({
  items,
  currentPath,
  isOpen,
  onOpenChange,
}: MobileNavProps): React.ReactNode {
  const { data: session } = useSession();
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
            <Image src="/ic_logo_transparent.png" width={50} height={56} alt="Specus Logo" />
          </SheetTitle>
        </SheetHeader>

        {/* Authenticated: show user info at the top */}
        {session?.user && (
          <div className="flex items-center gap-3 border-b p-4">
            <Avatar>
              {session.user.image && (
                <AvatarImage src={session.user.image} alt={session.user.name ?? 'User'} />
              )}
              <AvatarFallback>
                {session.user.name ? getInitials(session.user.name) : <User className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              {session.user.name && (
                <span className="truncate text-sm font-medium">{session.user.name}</span>
              )}
              {session.user.email && (
                <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>
              )}
            </div>
          </div>
        )}

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

          {/* Auth actions at the bottom */}
          <div className="mt-2 border-t pt-2">
            {session?.user ? (
              <>
                <Link
                  href="/profile"
                  onClick={handleMenuItemClick}
                  className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-colors"
                >
                  <User className="size-4" />
                  <span className="text-base font-medium">Profile</span>
                </Link>
                <form method="POST" action="/api/auth/federated-signout">
                  <button
                    type="submit"
                    onClick={handleMenuItemClick}
                    className="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-colors"
                  >
                    <LogOut className="size-4" />
                    <span className="text-base font-medium">Sign out</span>
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/auth/signin"
                onClick={handleMenuItemClick}
                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-colors"
              >
                <span className="text-base font-medium">Sign in</span>
              </Link>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
