'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { switchDialog, closeDialog, type AuthDialogKey, type CheckEmailType } from '@/lib/auth-dialog';
import { LoginDialog } from './login-dialog';
import { RegisterDialog } from './register-dialog';
import { ForgotPasswordDialog } from './forgot-password-dialog';
import { CheckEmailDialog } from './check-email-dialog';
import { ProfileDialog } from './profile-dialog';
import { ChangeEmailDialog } from './change-email-dialog';
import { ChangePasswordDialog } from './change-password-dialog';
import { DeleteAccountDialog } from './delete-account-dialog';

export function AuthDialogManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modal = searchParams.get('modal') as AuthDialogKey | null;
  const type = searchParams.get('type') as CheckEmailType | null;

  const handleClose = () => closeDialog(router);
  const handleSwitch = (key: AuthDialogKey, params?: Record<string, string>) =>
    switchDialog(router, key, params);

  const validKeys: AuthDialogKey[] = [
    'login', 'register', 'forgot', 'check-email',
    'profile', 'change-email', 'change-password', 'delete-account',
  ];

  if (!modal || !validKeys.includes(modal)) return null;

  return (
    <>
      <LoginDialog
        open={modal === 'login'}
        onClose={handleClose}
        onSwitch={handleSwitch}
      />
      <RegisterDialog
        open={modal === 'register'}
        onClose={handleClose}
        onSwitch={handleSwitch}
      />
      <ForgotPasswordDialog
        open={modal === 'forgot'}
        onClose={handleClose}
        onSwitch={handleSwitch}
      />
      <CheckEmailDialog
        open={modal === 'check-email'}
        type={type ?? 'register'}
        onClose={handleClose}
      />
      <ProfileDialog
        open={modal === 'profile'}
        onClose={handleClose}
        onSwitch={handleSwitch}
      />
      <ChangeEmailDialog
        open={modal === 'change-email'}
        onClose={handleClose}
        onSwitch={handleSwitch}
      />
      <ChangePasswordDialog
        open={modal === 'change-password'}
        onClose={handleClose}
        onSwitch={handleSwitch}
      />
      <DeleteAccountDialog
        open={modal === 'delete-account'}
        onClose={handleClose}
        onSwitch={handleSwitch}
      />
    </>
  );
}
