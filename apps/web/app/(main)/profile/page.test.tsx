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

describe('ProfilePage', () => {
  beforeEach(() => {
    authMock.mockReset();
    isAuthenticatedSessionMock.mockReset();
    redirectMock.mockReset();
  });

  it('redirects unauthenticated sessions back to sign-in with profile callback', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user-1' },
      error: 'RefreshTokenError',
    });
    isAuthenticatedSessionMock.mockReturnValue(false);

    await ProfilePage();

    expect(redirectMock).toHaveBeenCalledWith('/auth/signin?callbackUrl=/profile');
  });

  it('redirects authenticated users to home with profile modal', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user-1', name: 'Specus User', email: 'user@specus.test' },
    });
    isAuthenticatedSessionMock.mockReturnValue(true);

    await ProfilePage();

    expect(redirectMock).toHaveBeenCalledWith('/?modal=profile');
  });
});
