export interface CookieOptions {
  domain?: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none" | boolean;
}

export function parseCookieHeader(
  header: string | null | undefined,
): { name: string; value: string }[] {
  if (!header) return [];
  return header.split(/;\s*/).flatMap((part) => {
    const eq = part.indexOf("=");
    if (eq === -1) return [];
    return [
      {
        name: part.slice(0, eq).trim(),
        value: decodeURIComponent(part.slice(eq + 1).trim()),
      },
    ];
  });
}

export function serializeCookie(
  name: string,
  value: string,
  opts: CookieOptions = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  parts.push(`Path=${opts.path ?? "/"}`);
  if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) {
    const v =
      typeof opts.sameSite === "string"
        ? opts.sameSite[0]!.toUpperCase() + opts.sameSite.slice(1)
        : "Strict";
    parts.push(`SameSite=${v}`);
  }
  return parts.join("; ");
}
