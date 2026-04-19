'use client';

import { useActionState, useEffect, useEffectEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { Button } from '@specus/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@specus/ui/components/dialog';
import { AuthSubmitButton } from '@/app/(main)/auth/auth-submit-button';
import { FormErrorAlert } from '@/app/(main)/auth/form-error-alert';
import { signInDialogAction } from '@/app/(main)/auth/actions/sign-in-action';
import type { AuthDialogKey } from '@/lib/auth-dialog';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitch: (key: AuthDialogKey) => void;
}

export function LoginDialog({ open, onClose, onSwitch }: LoginDialogProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [state, formAction] = useActionState(signInDialogAction, null);

  const onSignedIn = useEffectEvent(() => {
    onClose();
    updateSession().then(() => router.replace('/'));
  });

  useEffect(() => {
    if (state?.success) {
      onSignedIn();
    }
  }, [state?.success, router]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get started with Specus</DialogTitle>
          <DialogDescription>
            New here? We&apos;ll create your account automatically.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <FormErrorAlert message={state?.error} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <button
                type="button"
                onClick={() => onSwitch('forgot')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm font-medium"
                onClick={() => onSwitch('register')}
              >
                Register
              </Button>
            </p>
            <AuthSubmitButton
              idleLabel="Continue"
              pendingLabel="Signing in…"
              className="sm:w-auto"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
