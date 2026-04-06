import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    error?: 'RefreshTokenError';
  }

  interface User {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string;
    id_token?: string;
    expires_at?: number;
    refresh_token?: string;
    picture?: string | null;
    error?: 'RefreshTokenError';
  }
}
