import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './page';

const { authMock, isAuthenticatedSessionMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  isAuthenticatedSessionMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock('@specus/auth', () => ({
  auth: authMock,
}));

vi.mock('@specus/auth/session', () => ({
  isAuthenticatedSession: isAuthenticatedSessionMock,
}));

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt?: string }) => <span data-testid="mock-image" data-alt={alt} />,
}));

vi.mock('@specus/ui/components/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@specus/ui/components/card', () => ({
  Card: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  CardContent: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  CardHeader: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement> & { children: React.ReactNode }) => (
    <h1 {...props}>{children}</h1>
  ),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    authMock.mockReset();
    isAuthenticatedSessionMock.mockReset();
    redirectMock.mockReset();
  });

  it('redirects invalid sessions back to sign-in with the profile callback', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user-1' },
      error: 'RefreshTokenError',
    });
    isAuthenticatedSessionMock.mockReturnValue(false);

    await ProfilePage();

    expect(redirectMock).toHaveBeenCalledWith('/auth/signin?callbackUrl=/profile');
  });

  it('renders profile details for a valid session', async () => {
    authMock.mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Specus User',
        email: 'user@specus.test',
        image: null,
      },
    });
    isAuthenticatedSessionMock.mockReturnValue(true);

    render(await ProfilePage());

    expect(redirectMock).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Specus User' })).toBeInTheDocument();
    expect(screen.getByText('user@specus.test')).toBeInTheDocument();
  });
});
