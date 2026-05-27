/**
 * Tiny in-memory token bucket per identifier (IP address). The site runs as
 * a single Vercel function instance for a personal-traffic site, so a process
 * Map is fine — no Redis required. If we ever go multi-region we'd swap this
 * for a Vercel KV-backed bucket without changing call-sites.
 *
 * Limits are intentionally generous for a real visitor and tight enough to
 * blunt automated abuse. The bucket also auto-evicts cold entries to keep
 * memory bounded.
 */

interface Bucket {
  tokens: number;
  /** When tokens were last refilled, in epoch ms. */
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

/** Max requests in the window. */
const CAPACITY = 12;
/** Window length in ms (10 minutes). */
const WINDOW_MS = 10 * 60 * 1000;
/** Tokens regenerated per ms. */
const REFILL_PER_MS = CAPACITY / WINDOW_MS;
/** Drop entries that haven't been touched in this long. */
const EVICT_AFTER_MS = 60 * 60 * 1000;

export interface RateLimitResult {
  ok: boolean;
  /** Tokens remaining after this attempt (rounded down). */
  remaining: number;
  /** Suggested wait in seconds before retrying — 0 if ok. */
  retryAfter: number;
}

function evictStale(now: number) {
  // Bound work: only sweep occasionally.
  if (buckets.size < 200) return;
  for (const [id, b] of buckets) {
    if (now - b.updatedAt > EVICT_AFTER_MS) buckets.delete(id);
  }
}

export function consume(identifier: string): RateLimitResult {
  const now = Date.now();
  evictStale(now);

  const existing = buckets.get(identifier);
  let bucket: Bucket;
  if (!existing) {
    bucket = { tokens: CAPACITY, updatedAt: now };
  } else {
    const elapsed = now - existing.updatedAt;
    const refilled = Math.min(CAPACITY, existing.tokens + elapsed * REFILL_PER_MS);
    bucket = { tokens: refilled, updatedAt: now };
  }

  if (bucket.tokens < 1) {
    buckets.set(identifier, bucket);
    const retryAfter = Math.ceil((1 - bucket.tokens) / REFILL_PER_MS / 1000);
    return { ok: false, remaining: 0, retryAfter };
  }

  bucket.tokens -= 1;
  buckets.set(identifier, bucket);
  return { ok: true, remaining: Math.floor(bucket.tokens), retryAfter: 0 };
}
