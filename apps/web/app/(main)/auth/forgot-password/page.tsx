import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@specus/auth';
import { CheckCircle2 } from 'lucide-react';
import { AuthBreadcrumb } from '../breadcrumb';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata = { title: 'Forgot password' };

interface ForgotPasswordPageProps {
  searchParams: Promise<{ sent?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const session = await auth();
  if (session) {
    redirect('/profile');
  }

  const { sent } = await searchParams;

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <AuthBreadcrumb
          items={[
            { label: 'Sign in', href: '/auth/signin' },
            { label: 'Forgot password', href: '/auth/forgot-password' },
            { label: 'Email sent' },
          ]}
        />
        <div className="flex flex-col items-center gap-4 text-center" role="status">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-0">
            <CheckCircle2 className="size-6 text-green-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            If an account exists with that email, we&apos;ve sent a password reset link.
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="text-center text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <AuthBreadcrumb
          items={[{ label: 'Sign in', href: '/auth/signin' }, { label: 'Forgot password' }]}
        />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <Link
        href="/auth/signin"
        className="text-center text-sm font-medium text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  );
}
