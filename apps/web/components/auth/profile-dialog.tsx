'use client';

import { useSession } from 'next-auth/react';
import { isAuthenticatedSession } from '@specus/auth/session';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@specus/ui/components/dialog';
import { Button } from '@specus/ui/components/button';
import { Separator } from '@specus/ui/components/separator';
import type { AuthDialogKey } from '@/lib/auth-dialog';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitch: (key: AuthDialogKey) => void;
}

export function ProfileDialog({ open, onClose, onSwitch }: ProfileDialogProps) {
  const { data: session } = useSession();
  const isAuthenticated = isAuthenticatedSession(session);
  const email = isAuthenticated ? session.user.email : '';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Email section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSwitch('change-email')}>
              Change email
            </Button>
          </div>

          <Separator />

          {/* Password section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Configured</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSwitch('change-password')}>
              Change password
            </Button>
          </div>

          <Separator />

          {/* Account section */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">Account</p>
            <button
              type="button"
              onClick={() => onSwitch('delete-account')}
              className="w-fit text-sm text-destructive hover:underline transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
