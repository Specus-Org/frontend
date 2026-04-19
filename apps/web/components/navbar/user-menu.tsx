'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isAuthenticatedSession } from '@specus/auth/session';
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
import { openDialog } from '@/lib/auth-dialog';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name[0]?.toUpperCase() ?? '?';
}

export default function UserMenu(): React.ReactNode {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = isAuthenticatedSession(session);

  if (status === 'loading') {
    return <div className="size-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!isAuthenticated) {
    return (
      <Button className="bg-brand" size="sm" onClick={() => openDialog(router, 'login')}>
        Sign in
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
            {email && <p className="text-xs leading-none text-muted-foreground">{email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => openDialog(router, 'profile')}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/api/auth/logout';
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
