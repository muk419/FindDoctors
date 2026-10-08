"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DirectionsResponse,
  Doctor,
  Hospital,
  LatLng,
  Pharmacy,
  RatingSummary,
  SearchResponse,
  TravelMode,
} from "@/lib/types";
import { AnnouncementBar } from "./AnnouncementBar";
import { AreaSearch } from "./AreaSearch";
import { EmergencyConsult } from "./EmergencyConsult";
import { DirectionsPanel, type Destination } from "./DirectionsPanel";
import { DoctorCard } from "./DoctorCard";
import { HospitalCard } from "./HospitalCard";
import { Navbar } from "./Navbar";
import { PharmacyCard } from "./PharmacyCard";
import { DEFAULT_FILTERS, SearchForm, type Filters } from "./SearchForm";

// Leaflet needs `window`, so the map only renders in the browser.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading map…</div>,
});
const PAGE_SIZE = 20;
const FALLBACK_LOCATION: LatLng = { lat: 19.076, lng: 72.8777 }; // Mumbai

type Tab = "doctors" | "hospitals" | "pharmacies";
const TAB_LABELS: Record<Tab, string> = { doctors: "Doctors", hospitals: "Hospitals", pharmacies: "Medicals" };

type Selected = { id: string; destination: Destination };

export function FindDoctorApp() {
  const [origin, setOrigin] = useState<LatLng>(FALLBACK_LOCATION);
  const [locationStatus, setLocationStatus] = useState<"locating" | "gps" | "manual" | "area" | "fallback">("locating");
  const [areaName, setAreaName] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [tab, setTabState] = useState<Tab>("doctors");
  const [only24x7, setOnly24x7] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  const setTab = (t: Tab) => {
    setTabState(t);
    setShown(PAGE_SIZE);
  };

  const [selected, setSelected] = useState<Selected | null>(null);
  const [mode, setMode] = useState<TravelMode>("DRIVE");
  const [route, setRoute] = useState<DirectionsResponse | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const routeAbort = useRef<AbortController | null>(null);

  // Phones show the list or the map full-screen; desktops show both side by side.
  const [view, setView] = useState<"list" | "map">("list");
  const viewBar = useRef<HTMLDivElement>(null);
  const showView = (v: "list" | "map") => {
    setView(v);
    // Bring the switch to the top so the chosen view starts at the top of the screen.
    const bar = viewBar.current;
    if (bar && (v === "map" || window.scrollY > bar.offsetTop)) window.scrollTo({ top: bar.offsetTop });
  };

  const search = useCallback(async (f: Filters, at: LatLng) => {
    routeAbort.current?.abort();
    setSearching(true);
    setSearchError(null);
    setSelected(null);
    setRoute(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, lat: at.lat, lng: at.lng }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data);
      setShown(PAGE_SIZE);
      // A name like "Riddhi Vinayak" may only match a hospital — show that tab.
      if (!data.doctors.length && data.hospitals.length) setTab("hospitals");
      else if (data.doctors.length) setTab("doctors");
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }, []);

  const locate = useCallback(
    (f: Filters) => {
      const fallback = () => {
        setLocationStatus("fallback");
        search(f, FALLBACK_LOCATION);
      };
      if (!navigator.geolocation) return fallback();
      setLocationStatus("locating");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setOrigin(here);
          setLocationStatus("gps");
          search(f, here);
        },
        fallback,
        { enableHighAccuracy: true, timeout: 10000 },
      );
    },
    [search],
  );

  // Ask for the user's location once on load; the callbacks run the first search.
  useEffect(() => {
    // "Find a doctor" links from Health Tips open this page with ?disease=…
    const disease = new URLSearchParams(window.location.search).get("disease")?.slice(0, 100) ?? "";
    const id = setTimeout(() => {
      const initial = { ...DEFAULT_FILTERS, disease };
      setFilters(initial);
      locate(initial);
    }, 0);
    return () => clearTimeout(id);
  }, [locate]);

  const loadRoute = async (from: LatLng, to: Selected, travelMode: TravelMode) => {
    routeAbort.current?.abort();
    const controller = new AbortController();
    routeAbort.current = controller;
    setSelected(to);
    setMode(travelMode);
    setRouteLoading(true);
    setRouteError(null);
    try {
      const res = await fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: from, destination: to.destination.location, travelMode }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not get directions");
      setRoute(data);
    } catch (e) {
      if (controller.signal.aborted) return;
      setRoute(null);
      setRouteError(e instanceof Error ? e.message : "Could not get directions");
    } finally {
      if (!controller.signal.aborted) setRouteLoading(false);
    }
  };

  const selectDoctor = (d: Doctor) =>
    loadRoute(
      origin,
      {
        id: d.id,
        destination: {
          ...d,
          subtitle: [
            [d.kind, ...d.specialties].join(", "),
            d.degrees.map((x) => x.code).join(", "),
            d.hospital && `at ${d.hospital.name}`,
          ]
            .filter(Boolean)
            .join(" · "),
        },
      },
      mode,
    );

  const selectHospital = (h: Hospital) =>
    loadRoute(origin, { id: h.id, destination: { ...h, subtitle: h.reasons.join(" · ") } }, mode);

  const selectPharmacy = (p: Pharmacy) =>
    loadRoute(
      origin,
      { id: p.id, destination: { ...p, subtitle: p.open24x7 ? "💊 Medical store · Open 24×7" : "💊 Medical store" } },
      mode,
    );

  // Used by the Doctor on call popup: show the medical on the list and map with directions.
  const openPharmacy = (p: Pharmacy) => {
    setTab("pharmacies");
    selectPharmacy(p);
  };

  const pharmacies = results?.pharmacies ?? [];
  const visiblePharmacies = only24x7 ? pharmacies.filter((p) => p.open24x7) : pharmacies;
  const nearest24x7 = pharmacies.find((p) => p.open24x7) ?? null;

  // Show a new rating immediately in the list, map and open panel.
  const applyRating = (id: string, { average, count }: RatingSummary) => {
    const patch = <T extends { id: string }>(x: T): T =>
      x.id === id ? { ...x, rating: average, ratingCount: count } : x;
    setResults(
      (r) =>
        r && {
          ...r,
          doctors: r.doctors.map(patch),
          hospitals: r.hospitals.map(patch),
          pharmacies: r.pharmacies.map(patch),
        },
    );
    setSelected((s) =>
      s && s.id === id ? { ...s, destination: { ...s.destination, rating: average, ratingCount: count } } : s,
    );
  };

  const setAreaOrigin = (name: string, p: LatLng) => {
    setOrigin(p);
    setAreaName(name);
    setLocationStatus("area");
    search(filters, p);
  };

  const setManualOrigin = (p: LatLng) => {
    setOrigin(p);
    setLocationStatus("manual");
    search(filters, p);
  };

  const recommended = results?.hospitals.find((h) => h.id === results.recommendedHospitalId);

  const closeSelected = () => {
    routeAbort.current?.abort();
    setRouteLoading(false);
    setSelected(null);
    setRoute(null);
  };

  const locationText = {
    locating: "Finding your location…",
    gps: "📍 Using your current location",
    manual: "📍 Using the point you picked on the map",
    area: `📍 Searching around ${areaName}`,
    fallback: "📍 Location off — showing Mumbai. Tap the map or search an area.",
  }[locationStatus];

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 md:h-dvh">
      <AnnouncementBar />
      <Navbar />
      <EmergencyConsult
        medical={nearest24x7}
        nearestMedical={pharmacies[0] ?? null}
        onShowMedical={(p) => {
          openPharmacy(p);
          showView("map");
        }}
        searching={searching}
      />
      <header className="border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <span className="truncate">{locationText}</span>
            {locationStatus !== "gps" && locationStatus !== "locating" && (
              <button
                onClick={() => locate(filters)}
                className="shrink-0 rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
              >
                Use my location
              </button>
            )}
          </div>
          <AreaSearch near={origin} onPick={setAreaOrigin} />
        </div>
        <SearchForm
          filters={filters}
          onChange={setFilters}
          onSubmit={() => {
            search(filters, origin);
            showView("list");
          }}
          loading={searching}
        />
      </header>

      {/* Phone-only List / Map switch — sticks to the top while scrolling */}
      <div
        ref={viewBar}
        className="sticky top-0 z-[1100] flex gap-1 border-b border-slate-200 bg-white/95 p-1.5 backdrop-blur md:hidden"
      >
        {(
          [
            ["list", "📋 List"],
            ["map", "🗺️ Map"],
          ] as const
        ).map(([v, text]) => (
          <button
            key={v}
            onClick={() => showView(v)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
              view === v ? "bg-teal-600 text-white shadow" : "text-slate-600"
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      <main className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        <aside
          className={`${view === "map" ? "hidden" : "flex"} flex-1 flex-col bg-white md:flex md:min-h-0 md:w-[420px] md:flex-none md:border-r md:border-slate-200`}
        >
          {selected ? (
            <div className="p-4 pb-24 md:overflow-y-auto md:pb-4">
              <DirectionsPanel
                destination={selected.destination}
                origin={origin}
                mode={mode}
                onModeChange={(m) => loadRoute(origin, selected, m)}
                route={route}
                loading={routeLoading}
                error={routeError}
                onRated={(summary) => applyRating(selected.id, summary)}
                onShowMap={() => showView("map")}
                onClose={closeSelected}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-[52px] z-[1000] flex border-b border-slate-200 bg-white text-xs font-medium sm:text-sm md:static">
                {(["doctors", "hospitals", "pharmacies"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 whitespace-nowrap px-1 py-2.5 ${
                      tab === t ? "border-b-2 border-teal-600 text-teal-700" : "text-slate-500"
                    }`}
                  >
                    {TAB_LABELS[t]} ({results?.[t].length ?? 0})
                  </button>
                ))}
              </div>
              <div className="space-y-2 p-3 pb-24 md:flex-1 md:overflow-y-auto md:pb-3">
                {results?.specialty && (
                  <p className="text-xs text-slate-500">
                    Showing results for <span className="font-semibold">{results.specialty}</span>
                  </p>
                )}
                {searchError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{searchError}</p>}
                {searching && (
                  <p className="p-3 text-sm text-slate-500">
                    Searching within {filters.radiusKm} km…
                    {filters.radiusKm > 15 && " Large areas can take up to 30 seconds the first time."}
                  </p>
                )}

                {!searching && tab === "doctors" && (
                  <>
                    {recommended && (
                      <button
                        onClick={() => setTab("hospitals")}
                        className="w-full rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-sm"
                      >
                        ⭐ Best hospital for you: <span className="font-semibold">{recommended.name}</span>
                        <span className="block text-xs text-amber-800">
                          {recommended.rating?.toFixed(1) ?? "–"}★ · {recommended.distanceKm} km — see why →
                        </span>
                      </button>
                    )}
                    {results?.doctors.slice(0, shown).map((d) => (
                      <DoctorCard key={d.id} doctor={d} selected={false} onSelect={() => selectDoctor(d)} />
                    ))}
                    <ShowMore
                      total={results?.doctors.length ?? 0}
                      shown={shown}
                      onMore={() => setShown((n) => n + PAGE_SIZE)}
                    />
                    {results && results.doctors.length === 0 && (
                      <p className="p-3 text-sm text-slate-500">
                        No doctors found. Try a larger radius or lower rating filter.
                      </p>
                    )}
                  </>
                )}

                {!searching && tab === "hospitals" && (
                  <>
                    {results?.hospitals.slice(0, shown).map((h) => (
                      <HospitalCard
                        key={h.id}
                        hospital={h}
                        recommended={h.id === results.recommendedHospitalId}
                        selected={false}
                        onSelect={() => selectHospital(h)}
                      />
                    ))}
                    <ShowMore
                      total={results?.hospitals.length ?? 0}
                      shown={shown}
                      onMore={() => setShown((n) => n + PAGE_SIZE)}
                    />
                  </>
                )}

                {!searching && tab === "pharmacies" && results && (
                  <>
                    <label className="flex items-center justify-between gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                      <span>
                        🌙 Show only <b>24×7 open</b> medicals ({pharmacies.filter((p) => p.open24x7).length})
                      </span>
                      <input
                        type="checkbox"
                        checked={only24x7}
                        onChange={(e) => {
                          setOnly24x7(e.target.checked);
                          setShown(PAGE_SIZE);
                        }}
                        className="h-5 w-5 shrink-0 accent-green-600"
                      />
                    </label>
                    {visiblePharmacies.slice(0, shown).map((p) => (
                      <PharmacyCard key={p.id} pharmacy={p} onSelect={() => selectPharmacy(p)} />
                    ))}
                    <ShowMore
                      total={visiblePharmacies.length}
                      shown={shown}
                      onMore={() => setShown((n) => n + PAGE_SIZE)}
                    />
                    {visiblePharmacies.length === 0 && (
                      <p className="p-3 text-sm text-slate-500">
                        {only24x7
                          ? "No medical marked 24×7 in this area. Untick the filter or try a larger distance."
                          : "No medicals found. Try a larger distance."}
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </aside>

        <section
          className={`${view === "list" ? "hidden" : "block"} relative h-[calc(100dvh-52px)] md:block md:h-auto md:flex-1`}
        >
          <MapView
            origin={origin}
            doctors={results?.doctors ?? []}
            hospitals={results?.hospitals ?? []}
            pharmacies={tab === "pharmacies" ? visiblePharmacies : []}
            recommendedHospitalId={results?.recommendedHospitalId ?? null}
            selectedId={selected?.id ?? null}
            polyline={route?.polyline ?? null}
            visible={view === "map"}
            onSelectDoctor={selectDoctor}
            onSelectHospital={selectHospital}
            onSelectPharmacy={selectPharmacy}
            onSetOrigin={setManualOrigin}
          />

          {/* Phone-only route summary over the map */}
          {selected && (
            <div className="absolute bottom-3 left-3 right-20 z-[1000] rounded-xl bg-white p-3 shadow-lg md:hidden">
              <p className="truncate text-sm font-semibold text-slate-900">{selected.destination.name}</p>
              <p className="text-xs text-slate-600">
                {routeLoading ? "Finding route…" : route ? `${route.duration} · ${route.distance}` : (routeError ?? "")}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => showView("list")}
                  className="flex-1 rounded-lg bg-teal-600 py-1.5 text-xs font-semibold text-white"
                >
                  Details & steps
                </button>
                <button onClick={closeSelected} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs">
                  ✕
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ShowMore({ total, shown, onMore }: { total: number; shown: number; onMore: () => void }) {
  if (shown >= total) return null;
  return (
    <button
      onClick={onMore}
      className="w-full rounded-xl border border-teal-200 bg-teal-50 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-100"
    >
      Show more ({total - shown} more)
    </button>
  );
}
