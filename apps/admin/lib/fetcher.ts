/**
 * Shared SWR fetcher that throws on non-OK responses.
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}
