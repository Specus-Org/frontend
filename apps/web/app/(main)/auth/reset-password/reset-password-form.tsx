'use client';

import { useActionState } from 'react';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { AuthSubmitButton } from '../auth-submit-button';
import { FormErrorAlert } from '../form-error-alert';
import { resetPassword } from './action';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPassword, null);

  return (
    <>
      <FormErrorAlert message={state?.error} />

      <form action={formAction} className="flex flex-col gap-5" aria-label="Reset password form">
        <input type="hidden" name="flow_token" value={token} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="new_password">New password</Label>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            placeholder="Enter new password (min. 8 characters)"
            required
            autoComplete="new-password"
            minLength={8}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm_password">Confirm new password</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="Confirm new password"
            required
            autoComplete="new-password"
          />
        </div>

        <AuthSubmitButton idleLabel="Reset password" pendingLabel="Resetting…" />
      </form>
    </>
  );
}
