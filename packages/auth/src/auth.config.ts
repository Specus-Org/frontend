import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import { randomBytes, createHash } from 'crypto';

import './types/next-auth';

// ---------------------------------------------------------------------------
// OIDC discovery cache (module-scoped)
// ---------------------------------------------------------------------------

interface OidcConfig {
  token_endpoint: string;
  userinfo_endpoint: string;
  authorization_endpoint: string;
}

let cachedOidcConfig: OidcConfig | null = null;

async function getOidcConfig(): Promise<OidcConfig> {
  if (cachedOidcConfig) return cachedOidcConfig;

  const issuer = process.env.AUTH_AUTHENTIK_ISSUER!;
  const res = await fetch(`${issuer}/.well-known/openid-configuration`);
  cachedOidcConfig = (await res.json()) as OidcConfig;
  return cachedOidcConfig;
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

// ---------------------------------------------------------------------------
// Authentik Flow Executor — headless multi-step authentication
// ---------------------------------------------------------------------------

interface FlowChallenge {
  type: string;
  component: string;
  flow_info?: { title?: string };
  response_errors?: Record<string, Array<{ string: string }>>;
  [key: string]: unknown;
}

/**
 * Walk through Authentik's authentication flow headlessly via the Flow Executor API.
 *
 * 1. Hit the OAuth2 authorize endpoint headlessly (Accept: application/json)
 * 2. Authentik returns a flow challenge instead of an HTML login page
 * 3. Submit identification (email), then password as challenge responses
 * 4. On success, extract the authorization code from the final redirect
 * 5. Exchange the code for tokens using PKCE
 */
async function authenticateViaFlowExecutor(
  email: string,
  password: string,
): Promise<{
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in: number;
} | null> {
  const issuer = process.env.AUTH_AUTHENTIK_ISSUER!;
  const clientId = process.env.AUTH_AUTHENTIK_ID!;
  const clientSecret = process.env.AUTH_AUTHENTIK_SECRET!;
  const oidcConfig = await getOidcConfig();

  // We use a server-side only redirect URI that won't actually be called —
  // we intercept the redirect before it happens
  const redirectUri = `${process.env.AUTH_AUTHENTIK_REDIRECT_URI ?? 'http://localhost:3000/api/auth/callback/authentik-credentials'}`;

  // PKCE: generate code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = randomBytes(16).toString('hex');

  // Step 1: Initiate OAuth2 authorize flow headlessly
  const authorizeUrl = new URL(oidcConfig.authorization_endpoint);
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'openid profile email offline_access');
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');

  // Track cookies between requests (Authentik uses session cookies for flow state)
  let cookieJar = '';

  function extractCookies(response: Response): string {
    const setCookies = response.headers.getSetCookie?.() ?? [];
    const cookies = setCookies.map((c) => c.split(';')[0]).join('; ');
    if (cookies) {
      // Merge with existing cookies
      const existing = cookieJar ? cookieJar.split('; ') : [];
      const newCookies = cookies.split('; ');
      const merged = new Map(
        [...existing, ...newCookies].map((c) => {
          const [name] = c.split('=');
          return [name, c] as [string, string];
        }),
      );
      return Array.from(merged.values()).join('; ');
    }
    return cookieJar;
  }

  // Make the initial authorize request (headless — we follow redirects manually)
  let flowUrl: string | null = null;

  // Authentik may redirect to the flow executor URL
  const initRes = await fetch(authorizeUrl.toString(), {
    headers: {
      Accept: 'application/json',
      Cookie: cookieJar,
    },
    redirect: 'manual',
  });

  cookieJar = extractCookies(initRes);

  if (initRes.status >= 300 && initRes.status < 400) {
    // Follow the redirect to the flow executor
    flowUrl = initRes.headers.get('location');
    if (flowUrl && !flowUrl.startsWith('http')) {
      // Relative URL — resolve against Authentik base
      const base = new URL(issuer).origin;
      flowUrl = new URL(flowUrl, base).toString();
    }
  }

  if (!flowUrl) {
    // If no redirect, the authorize endpoint may have returned the challenge directly
    // Try to parse the response as JSON
    try {
      const body = (await initRes.json()) as FlowChallenge;
      if (body.type && body.component) {
        // We got the challenge directly — the URL we need to POST to is the authorize URL
        flowUrl = authorizeUrl.toString();
      }
    } catch {
      return null;
    }
  }

  if (!flowUrl) return null;

  // Step 2: GET the flow challenge
  const challengeRes = await fetch(flowUrl, {
    headers: {
      Accept: 'application/json',
      Cookie: cookieJar,
    },
  });

  cookieJar = extractCookies(challengeRes);
  let challenge = (await challengeRes.json()) as FlowChallenge;

  // Step 3: Walk through the flow challenges
  const maxSteps = 10;
  for (let step = 0; step < maxSteps; step++) {
    if (challenge.type === 'redirect') {
      // Flow complete — extract the authorization code from the redirect URL
      const redirectTo = challenge.to as string;
      const redirectUrl = new URL(redirectTo);
      const code = redirectUrl.searchParams.get('code');

      if (!code) return null;

      // Step 4: Exchange the authorization code for tokens (with PKCE)
      const tokenRes = await fetch(oidcConfig.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenRes.ok) return null;

      return (await tokenRes.json()) as {
        access_token: string;
        id_token?: string;
        refresh_token?: string;
        expires_in: number;
      };
    }

    // Determine what to submit based on the challenge component
    let responseBody: Record<string, string> = {};

    if (challenge.component === 'ak-stage-identification') {
      responseBody = { uid_field: email };
    } else if (challenge.component === 'ak-stage-password') {
      responseBody = { password };
    } else if (challenge.component === 'ak-stage-consent') {
      // Auto-accept consent for first-party apps
      responseBody = { token: (challenge.token as string) ?? '' };
    } else if (challenge.component === 'xak-flow-redirect') {
      // Flow redirected — might be the final redirect
      const to = challenge.to as string;
      if (to) {
        challenge = { type: 'redirect', component: '', to };
        continue;
      }
      return null;
    } else {
      // Unknown challenge — cannot proceed
      console.error('Unknown Authentik flow challenge:', challenge.component);
      return null;
    }

    // Submit the challenge response
    const submitRes = await fetch(flowUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: cookieJar,
      },
      body: JSON.stringify(responseBody),
    });

    cookieJar = extractCookies(submitRes);

    if (!submitRes.ok && submitRes.status !== 302) {
      const errorBody = await submitRes.json().catch(() => null);
      console.error('Flow executor error:', submitRes.status, errorBody);
      return null;
    }

    if (submitRes.status === 302 || submitRes.status === 303) {
      const location = submitRes.headers.get('location');
      if (location) {
        challenge = { type: 'redirect', component: '', to: location };
        continue;
      }
    }

    challenge = (await submitRes.json()) as FlowChallenge;

    // Check for validation errors (e.g., wrong password)
    if (challenge.response_errors && Object.keys(challenge.response_errors).length > 0) {
      return null;
    }
  }

  return null;
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

          // Decode expires_at from the JWT access token
          const payload = JSON.parse(
            Buffer.from(tokens.access_token.split('.')[1]!, 'base64').toString(),
          );

          return {
            id: userInfo.sub,
            name: userInfo.name ?? email,
            email: userInfo.email ?? email,
            image: userInfo.picture ?? null,
            accessToken: tokens.access_token,
            idToken: tokens.id_token,
            refreshToken: tokens.refresh_token,
            expiresAt: payload.exp as number,
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
