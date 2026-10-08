import "server-only";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RatingSummary } from "./types";

/**
 * The app's own ratings (OpenStreetMap has none). Stored as
 * { [placeId]: { [voterId]: stars } } so each browser gets one vote per place.
 */
type Store = Record<string, Record<string, number>>;

const FILE = path.join(process.cwd(), ".data", "ratings.json");
let store: Store | null = null;

function load(): Store {
  if (!store) {
    try {
      store = JSON.parse(readFileSync(FILE, "utf8"));
    } catch {
      store = {};
    }
  }
  return store!;
}

function save() {
  try {
    mkdirSync(path.dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(store));
  } catch {
    // Read-only filesystem (e.g. serverless) — ratings live in memory until restart.
  }
}

export function getRating(placeId: string): RatingSummary {
  const votes = Object.values(load()[placeId] ?? {});
  if (!votes.length) return { average: null, count: 0 };
  const average = votes.reduce((a, b) => a + b, 0) / votes.length;
  return { average: Math.round(average * 10) / 10, count: votes.length };
}

export function getVote(placeId: string, voterId: string): number | null {
  return load()[placeId]?.[voterId] ?? null;
}

export function rate(placeId: string, voterId: string, stars: number): RatingSummary {
  const s = load();
  (s[placeId] ??= {})[voterId] = stars;
  save();
  return getRating(placeId);
}
