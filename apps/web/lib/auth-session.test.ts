import { describe, expect, it } from 'vitest';
import { hasRefreshTokenError, isAuthenticatedSession } from '../../../packages/auth/src/session';

describe('auth session helpers', () => {
  it('treats a refresh-token error as unauthenticated even if user data is still present', () => {
    const session = {
      user: { id: 'user-1', name: 'Specus User' },
      error: 'RefreshTokenError' as const,
    };

    expect(hasRefreshTokenError(session)).toBe(true);
    expect(isAuthenticatedSession(session)).toBe(false);
  });

  it('accepts a session with user data and no auth error', () => {
    expect(
      isAuthenticatedSession({
        user: { id: 'user-1', name: 'Specus User' },
      }),
    ).toBe(true);
  });
});
