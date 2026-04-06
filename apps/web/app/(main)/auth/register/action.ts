'use server';

import { redirect } from 'next/navigation';

interface RegisterState {
  error?: string;
  values?: { name: string; email: string };
}

export async function register(
  _prevState: RegisterState | null,
  formData: FormData,
): Promise<RegisterState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const values = { name, email };

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.', values };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.', values };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

  const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.message ?? 'Registration failed. Please try again.';
    return { error: message, values };
  }

  redirect('/auth/register/success');
}
