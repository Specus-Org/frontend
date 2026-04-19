'use server';

import { auth } from '@specus/auth';
import { getApiBaseUrl } from '@/lib/api';

export interface ChangeEmailState {
  success?: true;
  error?: string;
}

export async function changeEmailAction(
  _prevState: ChangeEmailState | null,
  formData: FormData,
): Promise<ChangeEmailState> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email) {
    return { error: 'Email is required.' };
  }

  const session = await auth();
  if (!session?.user) {
    return { error: 'You must be signed in to change your email.' };
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/user/email`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        typeof body?.message === 'string' ? body.message : 'Failed to update email. Please try again.';
      return { error: message };
    }
  } catch {
    return { error: 'Service unavailable. Please try again.' };
  }

  return { success: true };
}
