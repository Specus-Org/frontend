import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import { AuthBreadcrumb } from '../../breadcrumb';

export const metadata = { title: 'Password reset' };

export default function ResetPasswordSuccessPage() {
  return (
    <div className="flex flex-col gap-6">
      <AuthBreadcrumb items={[{ label: 'Reset password', href: '/auth/reset-password' }, { label: 'Success' }]} />
      <div className="flex flex-col items-center gap-4 text-center" role="status">
        <div className="flex size-12 items-center justify-center rounded-full bg-green-0">
          <CheckCircle2 className="size-6 text-green-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Password updated
        </h1>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
      </div>
      <Button size="lg" className="w-full" asChild>
        <Link href="/auth/signin">Sign in</Link>
      </Button>
    </div>
  );
}
