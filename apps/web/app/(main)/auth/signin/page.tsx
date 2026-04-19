import { redirect } from 'next/navigation';
import { auth } from '@specus/auth';
import { isAuthenticatedSession } from '@specus/auth/session';

export const metadata = { title: 'Sign in' };

export default async function SignInPage() {
  const session = await auth();
  if (isAuthenticatedSession(session)) {
    redirect('/');
  }
  redirect('/?modal=login');
}
