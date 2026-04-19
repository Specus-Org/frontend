'use server';

import { auth } from '@specus/auth';
import { getApiBaseUrl } from '@/lib/api';

export interface ChangePasswordState {
  success?: true;
  error?: string;
}

export async function changePasswordAction(
  _prevState: ChangePasswordState | null,
  formData: FormData,
): Promise<ChangePasswordState> {
  const oldPassword = formData.get('oldPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!oldPassword) {
    return { error: 'Current password is required.' };
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const session = await auth();
  if (!session?.user) {
    return { error: 'You must be signed in to change your password.' };
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/user/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        typeof body?.message === 'string' ? body.message : 'Failed to update password. Please try again.';
      return { error: message };
    }
  } catch {
    return { error: 'Service unavailable. Please try again.' };
  }

  return { success: true };
}
