'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@specus/ui/components/card';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email first.',
  AUTH_SERVICE_UNAVAILABLE:
    'Authentication service is temporarily unavailable. Please try again later.',
  BAD_REQUEST: 'Please provide both email and password.',
  AUTH_ERROR: 'An authentication error occurred. Please try again.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({
          code: 'AUTH_ERROR',
          message: 'Authentication failed',
        }));

        const errorMessage =
          ERROR_MESSAGES[data.code] ??
          data.message ??
          'Authentication failed. Please try again.';
        setError(errorMessage);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(
        'Network error. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/50 py-8 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Shield className="size-6" />
        </div>
        <CardTitle className="text-xl font-semibold">Specus Admin</CardTitle>
        <CardDescription>
          Sign in to the administration dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email or Username</Label>
            <Input
              id="email"
              type="text"
              placeholder="admin@specus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="mt-1 w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
