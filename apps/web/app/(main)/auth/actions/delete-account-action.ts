'use server';

import { auth } from '@specus/auth';
import { getApiBaseUrl } from '@/lib/api';

export interface DeleteAccountState {
  success?: true;
  error?: string;
}

export async function deleteAccountAction(
  _prevState: DeleteAccountState | null,
  formData: FormData,
): Promise<DeleteAccountState> {
  const confirmedEmail = formData.get('email') as string;

  const session = await auth();
  if (!session?.user) {
    return { error: 'You must be signed in to delete your account.' };
  }

  if (confirmedEmail !== session.user.email) {
    return { error: 'Email does not match your account email.' };
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/user/account`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        typeof body?.message === 'string'
          ? body.message
          : 'Failed to delete account. Please try again.';
      return { error: message };
    }
  } catch {
    return { error: 'Service unavailable. Please try again.' };
  }

  return { success: true };
}
