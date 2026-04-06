'use server';

import { signIn } from '@specus/auth';
import { AuthError } from 'next-auth';

interface SignInState {
  error?: string;
  success?: boolean;
  redirectTo?: string;
}

export async function signInAction(
  _prevState: SignInState | null,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const callbackUrl = (formData.get('callbackUrl') as string) || '/profile';

  try {
    await signIn('authentik-credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true, redirectTo: callbackUrl };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password. Please try again.' };
    }
    throw error;
  }
}
