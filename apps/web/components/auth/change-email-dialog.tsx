'use client';

import { useActionState, useEffect, useEffectEvent } from 'react';
import { useSession } from 'next-auth/react';
import { isAuthenticatedSession } from '@specus/auth/session';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@specus/ui/components/dialog';
import { AuthSubmitButton } from '@/app/(main)/auth/auth-submit-button';
import { FormErrorAlert } from '@/app/(main)/auth/form-error-alert';
import { changeEmailAction } from '@/app/(main)/auth/actions/change-email-action';
import type { AuthDialogKey } from '@/lib/auth-dialog';

interface ChangeEmailDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitch: (key: AuthDialogKey, params?: Record<string, string>) => void;
}

export function ChangeEmailDialog({ open, onClose, onSwitch }: ChangeEmailDialogProps) {
  const { data: session } = useSession();
  const currentEmail = isAuthenticatedSession(session) ? (session.user.email ?? '') : '';
  const [state, formAction] = useActionState(changeEmailAction, null);

  const onSentChangeEmail = useEffectEvent(() => {
    onSwitch('check-email', { type: 'change-email' });
  });

  useEffect(() => {
    if (state?.success) {
      onSentChangeEmail();
    }
  }, [state?.success]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Email</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <FormErrorAlert message={state?.error} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="change-email">Email</Label>
            <Input
              id="change-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              defaultValue={currentEmail}
            />
          </div>

          <DialogFooter>
            <AuthSubmitButton
              idleLabel="Update email"
              pendingLabel="Updating…"
              className="sm:w-auto"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
