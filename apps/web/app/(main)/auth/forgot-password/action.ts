'use server';

import { redirect } from 'next/navigation';

interface ForgotPasswordState {
  error?: string;
}

export async function forgotPassword(
  _prevState: ForgotPasswordState | null,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email) {
    return { error: 'Email is required.' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      return { error: 'Something went wrong. Please try again.' };
    }
  } catch {
    return { error: 'Service unavailable. Please try again.' };
  }

  redirect('/auth/forgot-password?sent=1');
}
