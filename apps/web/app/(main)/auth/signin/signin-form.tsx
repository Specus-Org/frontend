'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { AlertCircle } from 'lucide-react';
import { SubmitButton } from './submit-button';
import { signInAction } from './action';

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction] = useActionState(signInAction, null);

  useEffect(() => {
    if (state?.success) {
      // Full page redirect so the root layout re-runs with the fresh session
      window.location.href = state.redirectTo ?? '/profile';
    }
  }, [state]);

  return (
    <>
      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5" aria-label="Sign in form">
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? '/profile'} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={0}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
