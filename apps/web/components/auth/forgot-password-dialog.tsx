'use client';

import { useActionState, useEffect } from 'react';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@specus/ui/components/dialog';
import { AuthSubmitButton } from '@/app/(main)/auth/auth-submit-button';
import { FormErrorAlert } from '@/app/(main)/auth/form-error-alert';
import { forgotPasswordDialogAction } from '@/app/(main)/auth/actions/forgot-password-action';
import type { AuthDialogKey } from '@/lib/auth-dialog';

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitch: (key: AuthDialogKey, params?: Record<string, string>) => void;
}

export function ForgotPasswordDialog({ open, onClose, onSwitch }: ForgotPasswordDialogProps) {
  const [state, formAction] = useActionState(forgotPasswordDialogAction, null);

  useEffect(() => {
    if (state?.success) {
      onSwitch('check-email', { type: 'forgot' });
    }
  }, [state?.success, onSwitch]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            Enter your email and we&apos;ll send you a reset link.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <FormErrorAlert message={state?.error} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <DialogFooter>
            <AuthSubmitButton idleLabel="Send reset link" pendingLabel="Sending…" className="sm:w-auto" />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
