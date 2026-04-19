import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserMenu from './user-menu';

const { useSessionMock, useRouterMock } = vi.hoisted(() => ({
  useSessionMock: vi.fn(),
  useRouterMock: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
}));

vi.mock('next/navigation', () => ({
  useRouter: useRouterMock,
}));

vi.mock('@/lib/auth-dialog', () => ({
  openDialog: vi.fn(),
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
    children,
  }: {
    asChild?: boolean;
    children: React.ReactNode;
  }) => <div>{children}</div>,
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
    useRouterMock.mockReturnValue({ push: vi.fn(), replace: vi.fn() });
  });

  it('shows the sign-in button instead of profile controls when refresh failed', () => {
    useSessionMock.mockReturnValue({
      data: {
        user: { id: 'user-1', name: 'Specus User' },
        error: 'RefreshTokenError',
      },
      status: 'authenticated',
    });

    render(<UserMenu />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByText(/profile/i)).not.toBeInTheDocument();
  });
});
