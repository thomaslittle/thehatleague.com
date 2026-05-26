/**
 * Normalize a `redirect` query-string value to a same-origin path.
 *
 * Defends against open-redirect attacks where a crafted sign-in URL like
 *   /signin?redirect=https://evil.com
 * would bounce the user off-site after auth.
 *
 * Returns `fallback` unless the value is:
 *   - A non-empty string
 *   - Starts with a single "/"
 *   - Does NOT start with "//" (protocol-relative URL)
 *   - Does NOT start with "/\" (some browsers treat this as schemeless host)
 */
export function safeRedirectPath(
  raw: unknown,
  fallback: string = "/dashboard",
): string {
  if (typeof raw !== "string") return fallback;
  if (raw.length === 0) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.startsWith("/\\")) return fallback;
  return raw;
}
