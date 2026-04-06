'use server';

import { redirect } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api';

interface RegisterState {
  error?: string;
  values?: { name: string; email: string };
}

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === 'string' ? value : null;
}

export async function register(
  _prevState: RegisterState | null,
  formData: FormData,
): Promise<RegisterState> {
  const name = getString(formData, 'name') ?? '';
  const email = getString(formData, 'email') ?? '';
  const password = getString(formData, 'password');
  const confirmPassword = getString(formData, 'confirmPassword');

  const values = { name, email };

  if (!email) {
    return { error: 'Email is required.', values };
  }

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.', values };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.', values };
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        typeof body?.message === 'string' ? body.message : 'Registration failed. Please try again.';
      return { error: message, values };
    }
  } catch {
    return { error: 'Service unavailable. Please try again.', values };
  }

  redirect('/auth/register/success');
}
