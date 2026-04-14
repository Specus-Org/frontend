import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@specus/auth';
import { isAuthenticatedSession } from '@specus/auth/session';
import { Button } from '@specus/ui/components/button';
import { LogOut } from 'lucide-react';
import { AuthBreadcrumb } from '../breadcrumb';

export const metadata = { title: 'Sign out' };

export default async function SignOutPage() {
  const session = await auth();
  if (!isAuthenticatedSession(session)) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthBreadcrumb items={[{ label: 'Sign out' }]} />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <LogOut className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign out</h1>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to sign out of your account?
        </p>
      </div>

      <div className="flex flex-col gap-3" role="group" aria-label="Sign out actions">
        <form method="POST" action="/api/auth/federated-signout">
          <Button type="submit" className="w-full" size="lg">
            Sign out
          </Button>
        </form>

        <Button variant="outline" size="lg" className="w-full" asChild>
          <Link href="/">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
