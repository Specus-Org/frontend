'use server';

import { redirect } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api';

interface ResetPasswordState {
  error?: string;
}

export async function resetPassword(
  _prevState: ResetPasswordState | null,
  formData: FormData,
): Promise<ResetPasswordState> {
  const flowToken = formData.get('flow_token');
  const newPassword = formData.get('new_password');
  const confirmPassword = formData.get('confirm_password');

  if (typeof flowToken !== 'string' || !flowToken) {
    return { error: 'Invalid reset link. Please request a new one.' };
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow_token: flowToken, new_password: newPassword }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        typeof body?.message === 'string'
          ? body.message
          : 'Password reset failed. The link may have expired.';
      return { error: message };
    }
  } catch {
    return { error: 'Service unavailable. Please try again.' };
  }

  redirect('/auth/reset-password/success');
}
