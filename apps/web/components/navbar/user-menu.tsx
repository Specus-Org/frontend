'use client';

import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@specus/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@specus/ui/components/dropdown-menu';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name[0]?.toUpperCase() ?? '?';
}

export default function UserMenu(): React.ReactNode {
  const { data: session, status } = useSession();

  // Handle refresh token errors by forcing re-authentication
  if (session?.error === 'RefreshTokenError') {
    signIn('authentik');
    return null;
  }

  // Loading state — fixed-size skeleton to prevent layout shift
  if (status === 'loading') {
    return <div className="size-8 animate-pulse rounded-full bg-muted" />;
  }

  // Unauthenticated — show sign-in button
  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/auth/signin">Sign in</Link>
      </Button>
    );
  }

  const { name, email, image } = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full p-0">
          <Avatar>
            {image && <AvatarImage src={image} alt={name ?? 'User'} />}
            <AvatarFallback>
              {name ? getInitials(name) : <User className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            {name && <p className="text-sm font-medium leading-none">{name}</p>}
            {email && (
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            // POST to federated signout for full OIDC logout
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/api/auth/federated-signout';
            document.body.appendChild(form);
            form.submit();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
