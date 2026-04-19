'use client';

import { useActionState, useEffect, useEffectEvent } from 'react';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { Button } from '@specus/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@specus/ui/components/dialog';
import { AuthSubmitButton } from '@/app/(main)/auth/auth-submit-button';
import { FormErrorAlert } from '@/app/(main)/auth/form-error-alert';
import { registerDialogAction } from '@/app/(main)/auth/actions/register-action';
import type { AuthDialogKey } from '@/lib/auth-dialog';

interface RegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitch: (key: AuthDialogKey, params?: Record<string, string>) => void;
}

export function RegisterDialog({ open, onClose, onSwitch }: RegisterDialogProps) {
  const [state, formAction] = useActionState(registerDialogAction, null);

  const onRegistered = useEffectEvent(() => {
    onSwitch('check-email', { type: 'register' });
  });

  useEffect(() => {
    if (state?.success) {
      onRegistered();
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
          <DialogTitle>Register</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <FormErrorAlert message={state?.error} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-name">Full name</Label>
            <Input
              id="register-name"
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
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              defaultValue={state?.values?.email}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password (min. 8 characters)"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-confirm">Confirm password</Label>
            <Input
              id="register-confirm"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm font-medium"
                onClick={() => onSwitch('login')}
              >
                Sign in
              </Button>
            </p>
            <AuthSubmitButton
              idleLabel="Create account"
              pendingLabel="Creating…"
              className="sm:w-auto"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
