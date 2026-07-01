'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { AuthSubmitButton } from '../auth-submit-button';
import { FormErrorAlert } from '../form-error-alert';
import { signInAction } from './action';
import { trackEvent } from '@/lib/analytics';

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  // On success, the server action calls redirect() — no client-side
  // useEffect needed. Only error states are returned to this component.
  const [state, formAction] = useActionState(signInAction, null);

  return (
    <>
      <FormErrorAlert message={state?.error} />

      <form
        action={formAction}
        className="flex flex-col gap-5"
        aria-label="Sign in form"
        data-umami-event="signin_form_submit"
        data-umami-event-surface="page"
        onSubmit={() => trackEvent('signin_form_submit', { surface: 'page' })}
      >
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
              data-umami-event="auth_switch_click"
              data-umami-event-from="signin_page"
              data-umami-event-to="forgot_password"
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

        <AuthSubmitButton
          idleLabel="Sign in"
          pendingLabel="Signing in…"
          analyticsEventName="signin_submit_click"
          analyticsEventData={{ surface: 'page' }}
        />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="font-medium text-primary hover:underline"
          data-umami-event="auth_switch_click"
          data-umami-event-from="signin_page"
          data-umami-event-to="register"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
