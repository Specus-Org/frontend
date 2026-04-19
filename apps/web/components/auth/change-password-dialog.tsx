'use client';

import { useActionState, useEffect } from 'react';
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
import { changePasswordAction } from '@/app/(main)/auth/actions/change-password-action';
import type { AuthDialogKey } from '@/lib/auth-dialog';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitch: (key: AuthDialogKey) => void;
}

export function ChangePasswordDialog({ open, onClose, onSwitch }: ChangePasswordDialogProps) {
  const [state, formAction] = useActionState(changePasswordAction, null);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state?.success, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Password</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <FormErrorAlert message={state?.error} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="old-password">Current password</Label>
            <Input
              id="old-password"
              name="oldPassword"
              type="password"
              placeholder="Enter your current password"
              required
              autoComplete="current-password"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              placeholder="Create a new password (min. 8 characters)"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-new-password">Confirm new password</Label>
            <Input
              id="confirm-new-password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-0 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => onSwitch('forgot')}
            >
              Forgot password?
            </Button>
          </div>

          <DialogFooter>
            <AuthSubmitButton idleLabel="Update password" pendingLabel="Updating…" className="sm:w-auto" />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
