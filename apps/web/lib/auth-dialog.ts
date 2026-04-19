import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export type AuthDialogKey =
  | 'login'
  | 'register'
  | 'forgot'
  | 'check-email'
  | 'profile'
  | 'change-email'
  | 'change-password'
  | 'delete-account';

export type CheckEmailType = 'register' | 'forgot' | 'change-email';

export function openDialog(router: AppRouterInstance, key: AuthDialogKey, params?: Record<string, string>): void {
  const searchParams = new URLSearchParams({ modal: key, ...params });
  router.push(`?${searchParams.toString()}`);
}

export function switchDialog(router: AppRouterInstance, key: AuthDialogKey, params?: Record<string, string>): void {
  const searchParams = new URLSearchParams({ modal: key, ...params });
  router.replace(`?${searchParams.toString()}`);
}

export function closeDialog(router: AppRouterInstance): void {
  router.push(window.location.pathname);
}
