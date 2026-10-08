import "server-only";

/** Small in-memory cache so repeating the same search doesn't hit the free OSM servers again. */
const cache = new Map<string, { at: number; value: unknown }>();

export function cached<T>(key: string, maxAgeMs: number): T | undefined {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < maxAgeMs) return hit.value as T;
  cache.delete(key);
  return undefined;
}

/** Returns an entry however old it is — used as a fallback when the free servers are down. */
export function stale<T>(key: string): T | undefined {
  return cache.get(key)?.value as T | undefined;
}

export function storeCache(key: string, value: unknown) {
  if (cache.size > 300) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), value });
}
