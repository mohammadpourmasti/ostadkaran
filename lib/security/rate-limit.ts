import "server-only";

// In-memory sliding-window limiter. State lives in this server process only: it resets on restart and is not
// shared between processes, so it is a first line of defence (the phone limit in the database is the shared,
// authoritative one). Keys expire on their own and the map is bounded.
const MAX_KEYS = 20_000;

type Store = Map<string, number[]>;
const globalStore = globalThis as unknown as { __rateLimitStore?: Store };
const store: Store = (globalStore.__rateLimitStore ??= new Map());

function prune(now: number, windowMs: number) {
  if (store.size < MAX_KEYS) return;
  for (const [key, hits] of store) {
    if (hits.length === 0 || now - hits[hits.length - 1] > windowMs) store.delete(key);
  }
  // Still full (a flood of distinct keys): drop the oldest half rather than grow without bound.
  if (store.size >= MAX_KEYS) {
    let drop = Math.floor(store.size / 2);
    for (const key of store.keys()) {
      if (drop-- <= 0) break;
      store.delete(key);
    }
  }
}

/** Records one attempt for `key` and says whether it is within `limit` attempts per `windowMs`. */
export function takeRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  prune(now, windowMs);
  const hits = (store.get(key) ?? []).filter((time) => now - time < windowMs);
  if (hits.length >= limit) {
    store.set(key, hits);
    return false;
  }
  hits.push(now);
  store.set(key, hits);
  return true;
}

/**
 * Claims `key` for `windowMs`. Returns false when it is already claimed (a duplicate). The caller should
 * `releaseClaim` if the work then fails, so a genuine retry is not mistaken for a duplicate.
 */
export function claimOnce(key: string, windowMs: number, now = Date.now()): boolean {
  prune(now, windowMs);
  const hits = store.get(key);
  if (hits && hits.some((time) => now - time < windowMs)) return false;
  store.set(key, [now]);
  return true;
}

export function releaseClaim(key: string) {
  store.delete(key);
}
