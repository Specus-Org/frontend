export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
}

export function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? '';
}
