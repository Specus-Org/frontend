'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { AuthSubmitButton } from '../auth-submit-button';
import { FormErrorAlert } from '../form-error-alert';
import { signInAction } from './action';

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  // On success, the server action calls redirect() — no client-side
  // useEffect needed. Only error states are returned to this component.
  const [state, formAction] = useActionState(signInAction, null);

  return (
    <>
      <FormErrorAlert message={state?.error} />

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

        <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in…" />
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
