"use client";

import type { DirectionsResponse, LatLng, RatingSummary, TravelMode } from "@/lib/types";
import { RateStars } from "./RateStars";
import { Stars } from "./Stars";

const MODES: { mode: TravelMode; label: string }[] = [
  { mode: "DRIVE", label: "🚗 Car" },
  { mode: "BIKE", label: "🚲 Cycle" },
  { mode: "WALK", label: "🚶 Walk" },
];

export type Destination = {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  rating: number | null;
  ratingCount: number;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  subtitle?: string;
};

export function DirectionsPanel({
  destination,
  origin,
  mode,
  onModeChange,
  route,
  loading,
  error,
  onClose,
  onRated,
  onShowMap,
}: {
  destination: Destination;
  origin: LatLng;
  mode: TravelMode;
  onModeChange: (m: TravelMode) => void;
  route: DirectionsResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRated: (summary: RatingSummary) => void;
  /** Phones only: switch to the map to see the route. */
  onShowMap?: () => void;
}) {
  const gmapsMode = { DRIVE: "driving", BIKE: "bicycling", WALK: "walking" }[mode];
  // A plain Google Maps link needs no API key and is free.
  const navigateUrl =
    `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.location.lat},${destination.location.lng}&travelmode=${gmapsMode}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{destination.name}</h2>
          {destination.subtitle && <p className="text-sm text-slate-600">{destination.subtitle}</p>}
          {destination.address && <p className="text-xs text-slate-500">{destination.address}</p>}
          {destination.openingHours && <p className="text-xs text-slate-500">🕒 {destination.openingHours}</p>}
          <div className="mt-1">
            <Stars rating={destination.rating} count={destination.ratingCount} />
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {destination.phone && (
          <a
            href={`tel:${destination.phone}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            📞 {destination.phone}
          </a>
        )}
        {destination.website && (
          <a
            href={destination.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            🌐 Website
          </a>
        )}
        <a
          href={navigateUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-teal-600 px-3 py-1.5 font-medium text-white hover:bg-teal-700"
        >
          Open in Google Maps ↗
        </a>
      </div>

      <RateStars key={destination.id} placeId={destination.id} onRated={onRated} />

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {MODES.map(({ mode: m, label }) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${
              mode === m ? "bg-white text-teal-700 shadow" : "text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-500">Finding the best route…</p>}
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {route && !loading && (
        <>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-teal-50 p-3">
            <div>
              <span className="text-xl font-bold text-teal-800">{route.duration}</span>
              <span className="ml-2 text-sm text-teal-700">({route.distance})</span>
            </div>
            {onShowMap && (
              <button
                onClick={onShowMap}
                className="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white md:hidden"
              >
                🗺️ View on map
              </button>
            )}
          </div>
          <ol className="space-y-2">
            {route.steps.map((s, i) => (
              <li key={i} className="flex gap-3 border-b border-slate-100 pb-2 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs">
                  {i + 1}
                </span>
                <div>
                  <p className="text-slate-800">{s.instruction}</p>
                  <p className="text-xs text-slate-500">{[s.distance, s.duration].filter(Boolean).join(" · ")}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
