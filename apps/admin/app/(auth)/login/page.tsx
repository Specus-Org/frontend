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
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-4 pb-4 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="size-5" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-semibold">Specus Admin</CardTitle>
          <CardDescription>
            Sign in to the administration dashboard
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@specus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
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
            className="w-full"
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
