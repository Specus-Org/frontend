'use server';

import { redirect } from 'next/navigation';

interface ResetPasswordState {
  error?: string;
}

export async function resetPassword(
  _prevState: ResetPasswordState | null,
  formData: FormData,
): Promise<ResetPasswordState> {
  const flowToken = formData.get('flow_token') as string;
  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

  const res = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flow_token: flowToken, new_password: newPassword }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.message ?? 'Password reset failed. The link may have expired.';
    return { error: message };
  }

  redirect('/auth/reset-password/success');
}
