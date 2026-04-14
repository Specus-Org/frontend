import { auth } from '@specus/auth';
import { isAuthenticatedSession } from '@specus/auth/session';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type AuthenticatedRequest = NextRequest & {
  auth?: unknown;
};

const PROTECTED_PATHS: readonly string[] = ['/profile'];

export default auth((req: AuthenticatedRequest) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const session = req.auth as { user?: unknown; error?: unknown } | null | undefined;

  if (isProtected && !isAuthenticatedSession(session)) {
    const signInUrl = new URL('/auth/signin', req.nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|auth|_next/static|_next/image|favicon.ico).*)'],
} satisfies { matcher: readonly string[] };
