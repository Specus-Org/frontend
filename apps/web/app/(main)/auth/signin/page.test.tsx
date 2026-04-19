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

describe('SignInPage', () => {
  beforeEach(() => {
    authMock.mockReset();
    isAuthenticatedSessionMock.mockReset();
    redirectMock.mockReset();
  });

  it('redirects authenticated sessions to home', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });
    isAuthenticatedSessionMock.mockReturnValue(true);

    await SignInPage();

    expect(redirectMock).toHaveBeenCalledWith('/');
  });

  it('redirects unauthenticated users to home with login modal', async () => {
    authMock.mockResolvedValue(null);
    isAuthenticatedSessionMock.mockReturnValue(false);

    await SignInPage();

    expect(redirectMock).toHaveBeenCalledWith('/?modal=login');
  });
});
