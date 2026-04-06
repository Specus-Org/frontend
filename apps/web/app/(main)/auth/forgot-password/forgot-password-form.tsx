'use client';

import { useActionState } from 'react';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { AuthSubmitButton } from '../auth-submit-button';
import { FormErrorAlert } from '../form-error-alert';
import { forgotPassword } from './action';

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, null);

  return (
    <>
      <FormErrorAlert message={state?.error} />

      <form action={formAction} className="flex flex-col gap-5" aria-label="Password reset form">
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

        <AuthSubmitButton idleLabel="Send reset link" pendingLabel="Sending…" />
      </form>
    </>
  );
}
