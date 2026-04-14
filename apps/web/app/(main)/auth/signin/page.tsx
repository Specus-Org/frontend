import { redirect } from 'next/navigation';
import { auth } from '@specus/auth';
import { isAuthenticatedSession } from '@specus/auth/session';
import { AuthBreadcrumb } from '../breadcrumb';
import { SignInForm } from './signin-form';

export const metadata = { title: 'Sign in' };

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  if (isAuthenticatedSession(session)) {
    redirect('/profile');
  }

  const { callbackUrl } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <AuthBreadcrumb items={[{ label: 'Sign in' }]} />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the platform.
        </p>
      </div>

      <SignInForm callbackUrl={callbackUrl} />
    </div>
  );
}
