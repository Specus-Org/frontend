import { redirect } from 'next/navigation';
import { auth } from '@specus/auth';
import { isAuthenticatedSession } from '@specus/auth/session';

export default async function ProfilePage() {
  const session = await auth();

  if (!isAuthenticatedSession(session)) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  redirect('/?modal=profile');
}
