import Link from 'next/link';
import { AuthBreadcrumb } from '../breadcrumb';
import { ResetPasswordForm } from './reset-password-form';

export const metadata = { title: 'Reset password' };

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <AuthBreadcrumb items={[{ label: 'Reset password' }]} />
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Invalid link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="text-center text-sm font-medium text-primary hover:underline"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <AuthBreadcrumb items={[{ label: 'Reset password' }]} />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password below.</p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  );
}
