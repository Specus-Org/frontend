'use client';

import { useActionState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { isAuthenticatedSession } from '@specus/auth/session';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { Button } from '@specus/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@specus/ui/components/dialog';
import { FormErrorAlert } from '@/app/(main)/auth/form-error-alert';
import { deleteAccountAction } from '@/app/(main)/auth/actions/delete-account-action';
import type { AuthDialogKey } from '@/lib/auth-dialog';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Deleting…
        </>
      ) : (
        'Delete Account'
      )}
    </Button>
  );
}

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitch: (key: AuthDialogKey) => void;
}

export function DeleteAccountDialog({
  open,
  onClose,
  onSwitch: _onSwitch,
}: DeleteAccountDialogProps) {
  const { data: session } = useSession();
  const isAuthenticated = isAuthenticatedSession(session);
  const userEmail = isAuthenticated ? (session.user.email ?? '') : '';
  const [state, formAction] = useActionState(deleteAccountAction, null);

  useEffect(() => {
    if (state?.success) {
      // POST to federated signout to clear session after account deletion
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/auth/logout';
      document.body.appendChild(form);
      form.submit();
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
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account?
            <br />
            <br />
            Deleting your <strong>{userEmail}</strong> account will delete all your associated data.
            You cannot undo this operation.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <FormErrorAlert message={state?.error} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="delete-confirm-email">To confirm, type your email below.</Label>
            <Input
              id="delete-confirm-email"
              name="email"
              type="email"
              placeholder={userEmail}
              required
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <DeleteSubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
