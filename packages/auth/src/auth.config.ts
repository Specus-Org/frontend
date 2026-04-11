import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

import './types/next-auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
}

/** Decode the payload of a JWT without verification (trusted backend token). */
function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split('.');
    if (!parts[1]) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// NextAuth configuration
// ---------------------------------------------------------------------------

const config: NextAuthConfig = {
  // Keep local development usable even when AUTH_SECRET is not configured.
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === 'development' ? 'specus-dev-auth-secret' : undefined),
  // Both apps run behind a reverse proxy in production, so Auth.js needs
  // to trust the forwarded host headers to resolve its own callback/session URLs.
  trustHost: true,
  providers: [
    Credentials({
      id: 'authentik-credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';

        if (!email || !password) return null;

        try {
          const loginRes = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            signal: AbortSignal.timeout(10000),
          });

          if (!loginRes.ok) return null;

          const tokens = (await loginRes.json()) as {
            access_token: string;
            refresh_token: string;
            id_token?: string;
          };

          // Extract user claims from the ID token (preferred) or access token
          const idPayload = tokens.id_token ? decodeJwtPayload(tokens.id_token) : null;
          const accessPayload = decodeJwtPayload(tokens.access_token);

          const sub = (idPayload?.sub ?? accessPayload?.sub) as string | undefined;
          const name = (idPayload?.name ?? idPayload?.preferred_username) as string | undefined;
          const userEmail = idPayload?.email as string | undefined;
          const picture = idPayload?.picture as string | undefined;

          // Derive expires_at from the access token
          let expiresAt = Math.floor(Date.now() / 1000 + 300); // default 5 min
          if (typeof accessPayload?.exp === 'number') {
            expiresAt = accessPayload.exp;
          }

          return {
            id: sub ?? email,
            name: name ?? email,
            email: userEmail ?? email,
            image: picture ?? null,
            accessToken: tokens.access_token,
            idToken: tokens.id_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
          };
        } catch (error) {
          console.error('Authentication failed:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: persist tokens from the user object
      if (user) {
        return {
          ...token,
          access_token: user.accessToken,
          id_token: user.idToken,
          expires_at: user.expiresAt,
          refresh_token: user.refreshToken,
        };
      }

      // Token has not expired yet — return as-is
      if (typeof token.expires_at === 'number' && Date.now() < token.expires_at * 1000) {
        return token;
      }

      // Token expired — attempt refresh via backend
      if (!token.refresh_token) {
        return { ...token, error: 'RefreshTokenError' as const };
      }

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: token.refresh_token }),
          signal: AbortSignal.timeout(5000),
        });

        const tokensOrError = await response.json();

        if (!response.ok) {
          throw tokensOrError;
        }

        const newTokens = tokensOrError as {
          access_token: string;
          id_token?: string;
          refresh_token: string;
        };

        // Derive new expiry from the refreshed access token
        const payload = decodeJwtPayload(newTokens.access_token);
        const expiresAt =
          typeof payload?.exp === 'number' ? payload.exp : Math.floor(Date.now() / 1000 + 300);

        return {
          ...token,
          access_token: newTokens.access_token,
          id_token: newTokens.id_token ?? token.id_token,
          expires_at: expiresAt,
          refresh_token: newTokens.refresh_token ?? token.refresh_token,
          error: undefined,
        };
      } catch (error) {
        console.error('Error refreshing access_token', error);
        return { ...token, error: 'RefreshTokenError' as const };
      }
    },

    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.name) {
        session.user.name = token.name;
      }
      if (token.email) {
        session.user.email = token.email;
      }
      if (token.picture) {
        session.user.image = token.picture;
      }
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
