import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserMenu from './user-menu';

const { useSessionMock } = vi.hoisted(() => ({
  useSessionMock: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@specus/ui/components/button', () => ({
  Button: ({
    asChild,
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    children: React.ReactNode;
  }) => (asChild ? children : <button {...props}>{children}</button>),
}));

vi.mock('@specus/ui/components/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarImage: ({ alt }: { alt?: string }) => <span data-testid="avatar-image" data-alt={alt} />,
}));

vi.mock('@specus/ui/components/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    asChild,
    children,
  }: {
    asChild?: boolean;
    children: React.ReactNode;
  }) => (asChild ? children : <div>{children}</div>),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({
    asChild,
    children,
  }: {
    asChild?: boolean;
    children: React.ReactNode;
  }) => (asChild ? children : <div>{children}</div>),
}));

describe('UserMenu', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
  });

  it('shows the sign-in action instead of profile controls when refresh failed', () => {
    useSessionMock.mockReturnValue({
      data: {
        user: { id: 'user-1', name: 'Specus User' },
        error: 'RefreshTokenError',
      },
      status: 'authenticated',
    });

    render(<UserMenu />);

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/signin',
    );
    expect(screen.queryByRole('link', { name: /profile/i })).not.toBeInTheDocument();
  });
});
