'use server';

import { signIn } from '@specus/auth';
import { AuthError } from 'next-auth';

export interface SignInState {
  success?: true;
  error?: string;
}

export async function signInDialogAction(
  _prevState: SignInState | null,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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

  return { success: true };
}
