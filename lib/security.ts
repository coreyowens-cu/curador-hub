/**
 * Shared security helpers for API routes.
 * - Origin allowlist (defense-in-depth CSRF check beyond SameSite=Lax)
 * - In-memory per-key rate limiter (single Railway instance — fine for now)
 */

const ALLOWED_ORIGINS = new Set<string>([
  "https://marketing.curadoros.com",
  "https://staging-marketing.curadoros.com",
  ...(process.env.NODE_ENV !== "production"
    ? [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
      ]
    : []),
]);

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) return ALLOWED_ORIGINS.has(origin);
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const u = new URL(referer);
      return ALLOWED_ORIGINS.has(`${u.protocol}//${u.host}`);
    } catch {
      return false;
    }
  }
  // No Origin and no Referer — server-to-server or hardened client. Reject for state changes.
  return false;
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      // simple GC: drop expired entries when map gets big
      for (const [k, v] of buckets) {
        if (v.resetAt <= now) buckets.delete(k);
      }
    }
    return { ok: true };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}
