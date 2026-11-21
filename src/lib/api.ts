export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, signal?: AbortSignal): Promise<{ data: T; meta?: any }> {
  const res = await fetch(`/api${path}`, { signal });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error?.message ?? "Request failed", res.status);
  return body;
}
