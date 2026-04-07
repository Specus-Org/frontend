'use server';

import { signIn } from '@specus/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

interface SignInState {
  error?: string;
}

export async function signInAction(
  _prevState: SignInState | null,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rawCallbackUrl = (formData.get('callbackUrl') as string) || '/profile';

  // Validate callbackUrl is a relative path to prevent open redirects
  let callbackUrl = '/profile';
  try {
    const url = new URL(rawCallbackUrl, 'http://localhost');
    if (url.origin === 'http://localhost') {
      callbackUrl = url.pathname + url.search + url.hash;
    }
  } catch {
    // Invalid URL — fall back to default
  }

  try {
    await signIn('authentik-credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password. Please try again.' };
    }
    throw error;
  }

  // redirect() throws a special Next.js error — must be called outside try/catch
  redirect(callbackUrl);
}
