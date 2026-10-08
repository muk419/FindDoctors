import "server-only";
import type { LatLng, TravelMode } from "./types";

const OVERPASS_URLS = [
  process.env.OVERPASS_URL,
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
].filter(Boolean) as string[];

const OSRM_PROFILES: Record<TravelMode, string> = {
  DRIVE: "https://routing.openstreetmap.de/routed-car/route/v1/driving",
  BIKE: "https://routing.openstreetmap.de/routed-bike/route/v1/driving",
  WALK: "https://routing.openstreetmap.de/routed-foot/route/v1/driving",
};

// The free OSM servers ask every app to identify itself.
const USER_AGENT = "FindDoctor/0.1 (Next.js demo app)";

export class OsmError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export type OsmPlace = {
  id: string;
  location: LatLng;
  tags: Record<string, string>;
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

/** All doctors, clinics, dentists, hospitals and pharmacies within the radius. */
export async function findHealthcare(center: LatLng, radiusKm: number): Promise<OsmPlace[]> {
  const around = `around:${Math.round(radiusKm * 1000)},${center.lat},${center.lng}`;
  const query = `[out:json][timeout:60];
(
  nwr["amenity"~"^(doctors|clinic|dentist|hospital|pharmacy)$"](${around});
  nwr["healthcare"~"^(doctor|clinic|dentist|hospital|centre|pharmacy)$"](${around});
  nwr["shop"="chemist"](${around});
);
out center tags 4000;`;

  let lastError: unknown;
  // Public servers are often briefly overloaded: try every mirror, then the main one once more.
  for (const [i, url] of [...OVERPASS_URLS, OVERPASS_URLS[0]].entries()) {
    if (i === OVERPASS_URLS.length) await new Promise((r) => setTimeout(r, 2000));
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": USER_AGENT },
        body: new URLSearchParams({ data: query }),
        // Wide areas (e.g. 50 km around a city) can take ~30 s on the free servers.
        signal: AbortSignal.timeout(radiusKm > 15 ? 60000 : 20000),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const data: { elements: OverpassElement[] } = await res.json();
      return data.elements.flatMap((e) => {
        const lat = e.lat ?? e.center?.lat;
        const lng = e.lon ?? e.center?.lon;
        if (lat == null || lng == null || !e.tags) return [];
        return [{ id: `${e.type}/${e.id}`, location: { lat, lng }, tags: e.tags }];
      });
    } catch (err) {
      lastError = err;
    }
  }
  console.error("Overpass failed", lastError);
  throw new OsmError("The free map search server is busy. Please try again in a minute.", 503);
}

export type GeocodeResult = { name: string; location: LatLng };

/** Turns an area name ("Virar West") into coordinates using OSM Nominatim. */
export async function geocode(query: string, near?: LatLng): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "5", addressdetails: "0" });
  if (near) {
    // Prefer (not require) results within ~50 km of where the user is.
    params.set("viewbox", `${near.lng - 0.5},${near.lat + 0.5},${near.lng + 0.5},${near.lat - 0.5}`);
  }
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  }).catch(() => null);
  if (!res?.ok) throw new OsmError("The free place search server is busy. Please try again.", 503);
  const data: { display_name: string; lat: string; lon: string }[] = await res.json();
  return data.map((d) => ({ name: d.display_name, location: { lat: Number(d.lat), lng: Number(d.lon) } }));
}

type OsrmStep = {
  distance: number;
  duration: number;
  name: string;
  maneuver: { type: string; modifier?: string; exit?: number };
};

type OsrmResponse = {
  code: string;
  message?: string;
  routes?: { distance: number; duration: number; geometry: string; legs: { steps: OsrmStep[] }[] }[];
};

export async function route(origin: LatLng, destination: LatLng, mode: TravelMode) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const res = await fetch(
    `${OSRM_PROFILES[mode]}/${coords}?overview=full&geometries=polyline&steps=true`,
    { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(20000), cache: "no-store" },
  ).catch(() => null);
  if (!res) throw new OsmError("The free routing server didn't respond. Please try again.", 503);
  const data: OsrmResponse = await res.json().catch(() => ({ code: "Error" }));
  const best = data.routes?.[0];
  if (data.code !== "Ok" || !best) throw new OsmError(data.message ?? "No route found", 404);
  return {
    distanceM: best.distance,
    durationS: best.duration,
    polyline: best.geometry,
    steps: best.legs.flatMap((l) => l.steps).map((s) => ({
      instruction: describeStep(s),
      distanceM: s.distance,
      durationS: s.duration,
    })),
  };
}

function describeStep({ maneuver: m, name }: OsrmStep): string {
  const road = name ? ` onto ${name}` : "";
  const dir = m.modifier ?? "";
  switch (m.type) {
    case "depart":
      return `Start${name ? ` on ${name}` : ""}`;
    case "arrive":
      return "You have arrived at your destination";
    case "turn":
    case "end of road":
      return `Turn ${dir}${road}`;
    case "continue":
    case "new name":
      return `Continue ${dir === "straight" ? "straight" : dir}${road}`.replace(/\s+/g, " ");
    case "merge":
      return `Merge ${dir}${road}`;
    case "on ramp":
      return `Take the ramp ${dir}${road}`;
    case "off ramp":
      return `Take the exit ${dir}${road}`;
    case "fork":
      return `Keep ${dir} at the fork${road}`;
    case "roundabout":
    case "rotary":
      return `At the roundabout, take exit ${m.exit ?? ""}${road}`.replace(/\s+/g, " ");
    default:
      return `${dir ? `Go ${dir}` : "Continue"}${road}`;
  }
}
