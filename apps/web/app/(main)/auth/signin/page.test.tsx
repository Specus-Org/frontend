import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SignInPage from './page';

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

vi.mock('../breadcrumb', () => ({
  AuthBreadcrumb: () => <nav>Breadcrumb</nav>,
}));

vi.mock('./signin-form', () => ({
  SignInForm: ({ callbackUrl }: { callbackUrl?: string }) => (
    <div data-testid="signin-form">{callbackUrl ?? 'no-callback'}</div>
  ),
}));

describe('SignInPage', () => {
  beforeEach(() => {
    authMock.mockReset();
    isAuthenticatedSessionMock.mockReset();
    redirectMock.mockReset();
  });

  it('redirects fully authenticated sessions to the profile page', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });
    isAuthenticatedSessionMock.mockReturnValue(true);

    await SignInPage({
      searchParams: Promise.resolve({ callbackUrl: '/profile' }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/profile');
  });

  it('renders the sign-in form when the session exists but refresh already failed', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user-1' },
      error: 'RefreshTokenError',
    });
    isAuthenticatedSessionMock.mockReturnValue(false);

    render(
      await SignInPage({
        searchParams: Promise.resolve({ callbackUrl: '/profile' }),
      }),
    );

    expect(redirectMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('signin-form')).toHaveTextContent('/profile');
  });
});
