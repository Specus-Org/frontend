'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { AuthSubmitButton } from '../auth-submit-button';
import { FormErrorAlert } from '../form-error-alert';
import { register } from './action';

export function RegisterForm() {
  const [state, formAction] = useActionState(register, null);

  return (
    <>
      <FormErrorAlert message={state?.error} />

      <form action={formAction} className="flex flex-col gap-5" aria-label="Create account form">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your full name"
            required
            autoComplete="name"
            autoFocus
            defaultValue={state?.values?.name}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            defaultValue={state?.values?.email}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password (min. 8 characters)"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
          />
        </div>

        <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating account…" />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
