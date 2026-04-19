'use server';

import { getApiBaseUrl } from '@/lib/api';

export interface ForgotPasswordState {
  success?: true;
  error?: string;
}

export async function forgotPasswordDialogAction(
  _prevState: ForgotPasswordState | null,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email) {
    return { error: 'Email is required.' };
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return { error: 'Something went wrong. Please try again.' };
    }
  } catch {
    return { error: 'Service unavailable. Please try again.' };
  }

  return { success: true };
}
