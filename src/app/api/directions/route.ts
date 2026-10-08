import { NextResponse, type NextRequest } from "next/server";
import { cached, storeCache } from "@/lib/cache";
import { OsmError, route } from "@/lib/osm";
import type { DirectionsResponse, TravelMode } from "@/lib/types";

const MODES: TravelMode[] = ["DRIVE", "BIKE", "WALK"];
const CACHE_MS = 60 * 60 * 1000;

const isCoord = (lat: unknown, lng: unknown) =>
  typeof lat === "number" && typeof lng === "number" && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

const formatDistance = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);

function formatDuration(s: number) {
  const mins = Math.max(1, Math.round(s / 60));
  return mins >= 60 ? `${Math.floor(mins / 60)} hr ${mins % 60} min` : `${mins} min`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { origin, destination, travelMode = "DRIVE" } = body ?? {};
  if (!isCoord(origin?.lat, origin?.lng) || !isCoord(destination?.lat, destination?.lng)) {
    return NextResponse.json({ error: "origin and destination {lat,lng} are required" }, { status: 400 });
  }
  if (!MODES.includes(travelMode)) {
    return NextResponse.json({ error: `travelMode must be one of ${MODES.join(", ")}` }, { status: 400 });
  }

  const r = (n: number) => n.toFixed(4);
  const cacheKey = JSON.stringify([r(origin.lat), r(origin.lng), r(destination.lat), r(destination.lng), travelMode]);
  const hit = cached<DirectionsResponse>(cacheKey, CACHE_MS);
  if (hit) return NextResponse.json(hit);

  try {
    const result = await route(origin, destination, travelMode);
    const response: DirectionsResponse = {
      distance: formatDistance(result.distanceM),
      duration: formatDuration(result.durationS),
      polyline: result.polyline,
      steps: result.steps.map((s) => ({
        instruction: s.instruction,
        distance: s.distanceM ? formatDistance(s.distanceM) : "",
        duration: s.durationS ? formatDuration(s.durationS) : "",
      })),
    };
    storeCache(cacheKey, response);
    return NextResponse.json(response);
  } catch (err) {
    const status = err instanceof OsmError ? err.status : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Directions failed" }, { status });
  }
}
