import { redirect } from 'next/navigation';
import { auth } from '@specus/auth';
import { isAuthenticatedSession } from '@specus/auth/session';

export const metadata = { title: 'Create account' };

export default async function RegisterPage() {
  const session = await auth();
  if (isAuthenticatedSession(session)) {
    redirect('/');
  }
  redirect('/?modal=register');
}
