'use client';

import { useActionState } from 'react';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { AlertCircle } from 'lucide-react';
import { ResetButton } from './submit-button';
import { forgotPassword } from './action';

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, null);

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

        <ResetButton />
      </form>
    </>
  );
}
