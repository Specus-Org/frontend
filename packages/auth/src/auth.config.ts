import NextAuth from 'next-auth';
import Authentik from 'next-auth/providers/authentik';
import type { NextAuthConfig } from 'next-auth';

import './types/next-auth';

const config: NextAuthConfig = {
  providers: [
    Authentik({
      authorization: {
        params: {
          scope: 'openid profile email offline_access',
        },
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
    async jwt({ token, account }) {
      // Initial sign-in: persist OAuth tokens in the JWT
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          id_token: account.id_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
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
        const issuer = process.env.AUTH_AUTHENTIK_ISSUER!;
        const discoveryUrl = `${issuer}/.well-known/openid-configuration`;
        const discovery = await fetch(discoveryUrl).then((r) => r.json());
        const tokenEndpoint: string = discovery.token_endpoint;

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
