import { NextResponse, type NextRequest } from "next/server";
import { cached, stale, storeCache } from "@/lib/cache";
import { extractDegrees, topDegreeLevel } from "@/lib/degrees";
import { distanceKm } from "@/lib/geo";
import { findHealthcare, OsmError, type OsmPlace } from "@/lib/osm";
import { fuzzyIncludes } from "@/lib/text";
import { getRating } from "@/lib/ratings";
import { doctorScore, proximity, weightedRating } from "@/lib/scoring";
import {
  isSpecialty,
  prettySpeciality,
  SPECIALTY_MATCH,
  specialtyForDisease,
  type Specialty,
} from "@/lib/specialties";
import type { Doctor, Hospital, LatLng, Pharmacy, SearchRequest, SearchResponse } from "@/lib/types";

// A clinic within this distance of a hospital is treated as part of it.
const SAME_BUILDING_KM = 0.05;
const MAX_DOCTORS = 300;
const MAX_HOSPITALS = 200;
const MAX_PHARMACIES = 200;
const PLACES_CACHE_MS = 6 * 60 * 60 * 1000;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round = (n: number) => Math.round(n * 10) / 10;

export async function POST(request: NextRequest) {
  const body: SearchRequest | null = await request.json().catch(() => null);
  const lat = body?.lat;
  const lng = body?.lng;
  if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Valid lat and lng are required" }, { status: 400 });
  }
  const origin = { lat, lng };
  const name = body!.name?.trim().slice(0, 100) ?? "";
  const disease = body!.disease?.trim().slice(0, 100) ?? "";
  const radiusKm = clamp(Number(body!.radiusKm) || 10, 1, 50);
  const minRating = clamp(Number(body!.minRating) || 0, 0, 5);
  const requested = body!.specialty?.trim() ?? "";
  const specialty: Specialty | null = isSpecialty(requested)
    ? requested
    : disease
      ? specialtyForDisease(disease)
      : null;

  // OSM data barely changes, so cache it per ~1 km area and radius.
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)},${radiusKm}`;
  let places = cached<OsmPlace[]>(cacheKey, PLACES_CACHE_MS);
  if (!places) {
    try {
      places = await findHealthcare(origin, radiusKm);
      storeCache(cacheKey, places);
    } catch (err) {
      places = stale<OsmPlace[]>(cacheKey);
      if (!places) {
        const status = err instanceof OsmError ? err.status : 500;
        return NextResponse.json({ error: err instanceof Error ? err.message : "Search failed" }, { status });
      }
    }
  }

  const named = places.filter((p) => placeName(p));
  const hospitalPlaces = named.filter(isHospital);
  const pharmacyPlaces = named.filter((p) => !isHospital(p) && isPharmacy(p));
  const clinicPlaces = named.filter((p) => !isHospital(p) && !isPharmacy(p));

  let doctors: Doctor[] = clinicPlaces
    .filter((p) => !name || fuzzyIncludes(name, searchableText(p)))
    .filter((p) => !specialty || matchesSpecialty(p, specialty))
    .map((p) => toDoctor(p, origin, radiusKm, hospitalPlaces))
    .filter((d) => d.distanceKm <= radiusKm)
    .filter((d) => !minRating || (d.rating ?? 0) >= minRating);

  const sorters: Record<string, (a: Doctor, b: Doctor) => number> = {
    best: (a, b) => b.score - a.score,
    rating: (a, b) => weightedRating(b.rating, b.ratingCount) - weightedRating(a.rating, a.ratingCount),
    distance: (a, b) => a.distanceKm - b.distanceKm,
  };
  doctors.sort(sorters[body!.sortBy ?? "best"] ?? sorters.best);
  doctors = doctors.slice(0, MAX_DOCTORS);

  const hospitals = rankHospitals(hospitalPlaces, doctors, origin, radiusKm, specialty, name, minRating);

  // Medicals ignore the doctor name / specialty filters — you need the nearest one either way.
  const pharmacies = pharmacyPlaces
    .map((p) => toPharmacy(p, origin))
    .filter((m) => m.distanceKm <= radiusKm)
    .filter((m) => !minRating || (m.rating ?? 0) >= minRating)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_PHARMACIES);

  const response: SearchResponse = {
    specialty,
    doctors,
    hospitals,
    pharmacies,
    recommendedHospitalId: hospitals[0]?.id ?? null,
  };
  return NextResponse.json(response);
}

function placeName(p: OsmPlace): string {
  return p.tags["name:en"] || p.tags.name || "";
}

function isHospital(p: OsmPlace) {
  return p.tags.amenity === "hospital" || p.tags.healthcare === "hospital";
}

function isPharmacy(p: OsmPlace) {
  return p.tags.amenity === "pharmacy" || p.tags.healthcare === "pharmacy" || p.tags.shop === "chemist";
}

/** OSM writes round-the-clock hours as "24/7"; shop names often say "24x7" / "24 Hours". */
function isOpen24x7(p: OsmPlace) {
  return (
    /24\s*\/\s*7|00:00\s*-\s*24:00/i.test(p.tags.opening_hours ?? "") ||
    /24\s*[x*×/]\s*7|24\s*hours?|24\s*hrs?/i.test(placeName(p))
  );
}

function toPharmacy(p: OsmPlace, origin: LatLng): Pharmacy {
  const { average, count } = getRating(p.id);
  return {
    id: p.id,
    name: placeName(p),
    address: address(p.tags),
    location: p.location,
    rating: average,
    ratingCount: count,
    ...contact(p.tags),
    open24x7: isOpen24x7(p),
    distanceKm: round(distanceKm(origin, p.location)),
  };
}

function searchableText(p: OsmPlace) {
  const t = p.tags;
  return [t.name, t["name:en"], t.operator, t.description, t["healthcare:speciality"]]
    .filter(Boolean)
    .join(" ");
}

function specialities(p: OsmPlace): string[] {
  const tags = p.tags["healthcare:speciality"]?.split(";").map((s) => s.trim()) ?? [];
  if (p.tags.amenity === "dentist" || p.tags.healthcare === "dentist") tags.push("dentist");
  return [...new Set(tags.filter(Boolean))];
}

function matchesSpecialty(p: OsmPlace, specialty: Specialty) {
  const { osm, words } = SPECIALTY_MATCH[specialty];
  const tags = specialities(p);
  if (tags.some((t) => osm.includes(t))) return true;
  if (words.test(placeName(p))) return true;
  // Untagged clinics are almost always general practice.
  return specialty === "General Physician" && tags.length === 0 && !/dent/i.test(placeName(p));
}

function address(t: Record<string, string>) {
  if (t["addr:full"]) return t["addr:full"];
  return [t["addr:housename"], t["addr:housenumber"], t["addr:street"], t["addr:suburb"], t["addr:city"], t["addr:postcode"]]
    .filter(Boolean)
    .join(", ");
}

function contact(t: Record<string, string>) {
  return {
    phone: t.phone || t["contact:phone"] || t["contact:mobile"] || null,
    website: t.website || t["contact:website"] || null,
    openingHours: t.opening_hours || null,
  };
}

function kindLabel(t: Record<string, string>) {
  if (t.amenity === "dentist" || t.healthcare === "dentist") return "Dentist";
  if (t.amenity === "doctors" || t.healthcare === "doctor") return "Doctor";
  return "Clinic";
}

function toDoctor(p: OsmPlace, origin: LatLng, radiusKm: number, hospitals: OsmPlace[]): Doctor {
  const dist = distanceKm(origin, p.location);
  const degrees = extractDegrees(placeName(p), p.tags.description);
  const { average, count } = getRating(p.id);
  return {
    id: p.id,
    name: placeName(p),
    kind: kindLabel(p.tags),
    address: address(p.tags),
    location: p.location,
    rating: average,
    ratingCount: count,
    ...contact(p.tags),
    specialties: specialities(p).map(prettySpeciality),
    distanceKm: round(dist),
    degrees,
    hospital: matchHospital(p, hospitals),
    score: doctorScore({
      rating: average,
      ratingCount: count,
      degreeLevel: topDegreeLevel(degrees),
      distanceKm: dist,
      radiusKm,
    }),
  };
}

// Names made only of these words ("Nursing Home", "City Hospital") are too generic to match on.
const GENERIC_WORDS = /^(the|city|general|civil|multi|super|speciality|specialty|hospital|clinic|nursing|home|medical|centre|center|health|care|and|&)$/i;

/** OSM doesn't link clinics to hospitals, so infer it from the name/address or the same building. */
function matchHospital(p: OsmPlace, hospitals: OsmPlace[]) {
  const haystack = `${placeName(p)} ${address(p.tags)}`.toLowerCase();
  const byName = hospitals.find((h) => {
    const n = placeName(h).toLowerCase();
    const distinctive = n.split(/\s+/).some((w) => w.length > 2 && !GENERIC_WORDS.test(w));
    return distinctive && haystack.includes(n);
  });
  if (byName) return { id: byName.id, name: placeName(byName) };

  const nearest = hospitals
    .map((h) => ({ h, d: distanceKm(p.location, h.location) }))
    .sort((a, b) => a.d - b.d)[0];
  if (nearest && nearest.d <= SAME_BUILDING_KM) return { id: nearest.h.id, name: placeName(nearest.h) };
  return null;
}

function rankHospitals(
  raw: OsmPlace[],
  doctors: Doctor[],
  origin: LatLng,
  radiusKm: number,
  specialty: Specialty | null,
  name: string,
  minRating: number,
): Hospital[] {
  return raw
    .filter((h) => !name || fuzzyIncludes(name, searchableText(h)) || doctors.some((d) => d.hospital?.id === h.id))
    .map((h): Hospital => {
      const dist = distanceKm(origin, h.location);
      const { average, count } = getRating(h.id);
      const linked = doctors.filter((d) => d.hospital?.id === h.id);
      const topDegree = Math.max(0, ...linked.map((d) => topDegreeLevel(d.degrees)));
      const specs = specialities(h);
      const matches = specialty ? matchesSpecialty(h, specialty) : false;
      const emergency = h.tags.emergency === "yes";

      const ratingScore = weightedRating(average, count) / 5;
      const proximityScore = proximity(dist, radiusKm);
      const careScore =
        (matches ? 0.4 : 0) + (emergency ? 0.2 : 0) + Math.min(specs.length, 4) * 0.05 + (topDegree / 5) * 0.2;
      const score = Math.round((ratingScore * 0.45 + proximityScore * 0.3 + Math.min(careScore, 1) * 0.25) * 100);

      const reasons: string[] = [];
      if (average != null) reasons.push(`Rated ${average.toFixed(1)}★ by ${count} user${count > 1 ? "s" : ""}`);
      if (dist <= 3) reasons.push(`Very close — ${round(dist)} km away`);
      if (matches) reasons.push(`Offers ${specialty}`);
      if (emergency) reasons.push("24×7 emergency");
      if (specs.length > 1) reasons.push(`${specs.length} specialities`);
      if (linked.length) reasons.push(`${linked.length} matching clinic${linked.length > 1 ? "s" : ""} here`);
      if (topDegree >= 5) reasons.push("Super-specialist doctors (DM / MCh / FRCS)");
      else if (topDegree >= 4) reasons.push("Specialist doctors (MD / MS / DNB)");

      return {
        id: h.id,
        name: placeName(h),
        address: address(h.tags),
        location: h.location,
        rating: average,
        ratingCount: count,
        ...contact(h.tags),
        specialties: specs.map(prettySpeciality),
        emergency,
        matchesSpecialty: matches,
        distanceKm: round(dist),
        doctorCount: linked.length,
        topDegreeLevel: topDegree,
        score,
        reasons,
      };
    })
    .filter((h) => h.distanceKm <= radiusKm)
    .filter((h) => !minRating || (h.rating ?? 0) >= minRating)
    // With a specialty chosen, hospitals that offer it always come first.
    .sort((a, b) => Number(b.matchesSpecialty) - Number(a.matchesSpecialty) || b.score - a.score)
    .slice(0, MAX_HOSPITALS);
}
