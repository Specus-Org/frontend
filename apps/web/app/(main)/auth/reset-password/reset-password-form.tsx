'use client';

import { useActionState } from 'react';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { AlertCircle } from 'lucide-react';
import { ResetPasswordButton } from './submit-button';
import { resetPassword } from './action';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPassword, null);

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

        <ResetPasswordButton />
      </form>
    </>
  );
}
