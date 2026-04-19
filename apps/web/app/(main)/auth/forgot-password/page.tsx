import { redirect } from 'next/navigation';
import { auth } from '@specus/auth';
import { isAuthenticatedSession } from '@specus/auth/session';

export const metadata = { title: 'Forgot password' };

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (isAuthenticatedSession(session)) {
    redirect('/');
  }
  redirect('/?modal=forgot');
}
