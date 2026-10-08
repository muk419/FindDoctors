import { NextResponse, type NextRequest } from "next/server";
import { cached, storeCache } from "@/lib/cache";
import { geocode, OsmError, type GeocodeResult } from "@/lib/osm";

const CACHE_MS = 24 * 60 * 60 * 1000;

/** GET /api/geocode?q=Virar West[&lat=..&lng=..] → [{ name, location }] */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim().slice(0, 120) ?? "";
  if (q.length < 2) return NextResponse.json({ error: "Type an area or city name" }, { status: 400 });
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const near = params.has("lat") && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  const key = `geo:${q.toLowerCase()}:${near ? `${lat.toFixed(1)},${lng.toFixed(1)}` : ""}`;
  const hit = cached<GeocodeResult[]>(key, CACHE_MS);
  if (hit) return NextResponse.json(hit);

  try {
    const results = await geocode(q, near);
    storeCache(key, results);
    return NextResponse.json(results);
  } catch (err) {
    const status = err instanceof OsmError ? err.status : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Place search failed" }, { status });
  }
}
