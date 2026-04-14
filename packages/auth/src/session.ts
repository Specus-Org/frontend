type SessionLike<TUser = unknown> = {
  user?: TUser | null;
  error?: unknown;
} | null | undefined;

export function hasRefreshTokenError<TUser>(session: SessionLike<TUser>): boolean {
  return session?.error === 'RefreshTokenError';
}

export function isAuthenticatedSession<TUser>(
  session: SessionLike<TUser>,
): session is { user: TUser; error?: unknown } {
  return Boolean(session?.user) && !hasRefreshTokenError(session);
}
