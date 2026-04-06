import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

import './types/next-auth';

// ---------------------------------------------------------------------------
// OIDC discovery cache (module-scoped)
// ---------------------------------------------------------------------------

interface OidcConfig {
  token_endpoint: string;
  userinfo_endpoint: string;
}

let cachedOidcConfig: OidcConfig | null = null;

async function getOidcConfig(): Promise<OidcConfig> {
  if (cachedOidcConfig) return cachedOidcConfig;

  const issuer = process.env.AUTH_AUTHENTIK_ISSUER!;
  const res = await fetch(`${issuer}/.well-known/openid-configuration`);
  if (!res.ok) {
    throw new Error(`OIDC discovery failed: ${res.status}`);
  }
  const config = (await res.json()) as Record<string, unknown>;
  if (!config.token_endpoint || !config.userinfo_endpoint) {
    throw new Error('OIDC discovery response missing required endpoints');
  }
  cachedOidcConfig = config as unknown as OidcConfig;
  return cachedOidcConfig;
}

// ---------------------------------------------------------------------------
// NextAuth configuration
// ---------------------------------------------------------------------------

const config: NextAuthConfig = {
  providers: [
    Credentials({
      id: 'authentik-credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };

        if (!email || !password) return null;

        try {
          // Authenticate via the backend API (which proxies to Authentik)
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
          const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!loginRes.ok) return null;

          const tokens = (await loginRes.json()) as {
            access_token: string;
            refresh_token: string;
            id_token?: string;
          };

          // Fetch user profile from Authentik's userinfo endpoint
          const oidcConfig = await getOidcConfig();
          const userInfoRes = await fetch(oidcConfig.userinfo_endpoint, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });

          if (!userInfoRes.ok) return null;

          const userInfo = (await userInfoRes.json()) as {
            sub: string;
            name?: string;
            email?: string;
            picture?: string;
          };

          // Decode expires_at from the JWT access token (with fallback)
          let expiresAt = Math.floor(Date.now() / 1000 + 300); // default 5 min
          try {
            const parts = tokens.access_token.split('.');
            if (parts[1]) {
              const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
              if (typeof payload.exp === 'number') {
                expiresAt = payload.exp;
              }
            }
          } catch {
            // Non-JWT or malformed token — use default expiry
          }

          return {
            id: userInfo.sub,
            name: userInfo.name ?? email,
            email: userInfo.email ?? email,
            image: userInfo.picture ?? null,
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
      // Initial sign-in: persist Authentik tokens from the user object
      if (user) {
        const u = user as typeof user & {
          accessToken?: string;
          idToken?: string;
          refreshToken?: string;
          expiresAt?: number;
        };
        return {
          ...token,
          access_token: u.accessToken,
          id_token: u.idToken,
          expires_at: u.expiresAt,
          refresh_token: u.refreshToken,
        };
      }

      // Token has not expired yet — return as-is
      if (typeof token.expires_at === 'number' && Date.now() < token.expires_at * 1000) {
        return token;
      }

      // Token expired — attempt refresh
      if (!token.refresh_token) {
        return { ...token, error: 'RefreshTokenError' as const };
      }

      try {
        const oidcConfig = await getOidcConfig();

        const response = await fetch(oidcConfig.token_endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.AUTH_AUTHENTIK_ID!,
            client_secret: process.env.AUTH_AUTHENTIK_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token,
          }),
        });

        const tokensOrError = await response.json();

        if (!response.ok) {
          throw tokensOrError;
        }

        const newTokens = tokensOrError as {
          access_token: string;
          id_token?: string;
          expires_in: number;
          refresh_token?: string;
        };

        return {
          ...token,
          access_token: newTokens.access_token,
          id_token: newTokens.id_token ?? token.id_token,
          expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
          refresh_token: newTokens.refresh_token ?? token.refresh_token,
          error: undefined,
        };
      } catch (error) {
        console.error('Error refreshing access_token', error);
        return { ...token, error: 'RefreshTokenError' as const };
      }
    },

    async session({ session, token }) {
      // Populate user fields from JWT so useSession() has them on the client
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
