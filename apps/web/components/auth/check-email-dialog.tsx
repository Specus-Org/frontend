'use client';

import { MailCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@specus/ui/components/dialog';
import { Button } from '@specus/ui/components/button';
import type { CheckEmailType } from '@/lib/auth-dialog';

const CONTENT: Record<CheckEmailType, { title: string; description: string }> = {
  register: {
    title: 'Confirm your email',
    description:
      "We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account.",
  },
  forgot: {
    title: 'Check your email',
    description:
      "We've sent a password reset link to your email address. Please check your inbox and follow the instructions.",
  },
  'change-email': {
    title: 'Confirm your new email',
    description:
      "We've sent a confirmation link to your new email address. Please check your inbox to complete the change.",
  },
};

interface CheckEmailDialogProps {
  open: boolean;
  type: CheckEmailType;
  onClose: () => void;
}

export function CheckEmailDialog({ open, type, onClose }: CheckEmailDialogProps) {
  const content = CONTENT[type] ?? {
    title: 'Check your email',
    description: "We've sent an email to your address. Please check your inbox.",
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{content.title}</DialogTitle>
          <DialogDescription className="text-center">{content.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
