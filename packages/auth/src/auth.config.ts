import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

import './types/next-auth';

// Cache the OIDC discovery document at module scope
let cachedTokenEndpoint: string | null = null;

async function getTokenEndpoint(): Promise<string> {
  if (cachedTokenEndpoint) return cachedTokenEndpoint;

  const issuer = process.env.AUTH_AUTHENTIK_ISSUER!;
  const res = await fetch(`${issuer}/.well-known/openid-configuration`);
  const config = await res.json();
  cachedTokenEndpoint = config.token_endpoint;
  return cachedTokenEndpoint!;
}

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
          const tokenEndpoint = await getTokenEndpoint();

          // Use Authentik's Resource Owner Password Credentials grant
          const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.AUTH_AUTHENTIK_ID!,
              client_secret: process.env.AUTH_AUTHENTIK_SECRET!,
              grant_type: 'password',
              username: email,
              password: password,
              scope: 'openid profile email offline_access',
            }),
          });

          if (!response.ok) return null;

          const tokens = (await response.json()) as {
            access_token: string;
            id_token?: string;
            refresh_token?: string;
            expires_in: number;
          };

          // Fetch user profile from Authentik's userinfo endpoint
          const issuer = process.env.AUTH_AUTHENTIK_ISSUER!;
          const discoveryRes = await fetch(`${issuer}/.well-known/openid-configuration`);
          const discovery = await discoveryRes.json();
          const userinfoEndpoint: string = discovery.userinfo_endpoint;

          const userInfoRes = await fetch(userinfoEndpoint, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });

          if (!userInfoRes.ok) return null;

          const userInfo = (await userInfoRes.json()) as {
            sub: string;
            name?: string;
            email?: string;
            picture?: string;
          };

          // Return user with embedded token data for the jwt callback
          return {
            id: userInfo.sub,
            name: userInfo.name ?? email,
            email: userInfo.email ?? email,
            image: userInfo.picture ?? null,
            // Token data passed through to jwt callback via the user object
            accessToken: tokens.access_token,
            idToken: tokens.id_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
          };
        } catch (error) {
          console.error('Authentik ROPC authentication failed:', error);
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
        const tokenEndpoint = await getTokenEndpoint();

        const response = await fetch(tokenEndpoint, {
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
      // Expose only safe fields to the client — access tokens stay server-only
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
