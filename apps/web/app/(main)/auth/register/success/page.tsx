import Link from 'next/link';
import { Mail } from 'lucide-react';
import { AuthBreadcrumb } from '../../breadcrumb';

export const metadata = { title: 'Check your email' };

export default function RegisterSuccessPage() {
  return (
    <div className="flex flex-col gap-6">
      <AuthBreadcrumb
        items={[
          { label: 'Create account', href: '/auth/register' },
          { label: 'Verification sent' },
        ]}
      />
      <div className="flex flex-col items-center gap-4 text-center" role="status">
        <div className="flex size-12 items-center justify-center rounded-full bg-blue-0">
          <Mail className="size-6 text-blue-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Please check your inbox and
          click the link to activate your account.
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
