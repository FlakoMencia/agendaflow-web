export function safeReturnUrl(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  if (value === '/login' || value.startsWith('/login?')) return fallback;
  return value;
}
