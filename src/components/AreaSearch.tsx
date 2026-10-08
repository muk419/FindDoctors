"use client";

import { useState } from "react";
import type { LatLng } from "@/lib/types";

type Result = { name: string; location: LatLng };

/** "Search in another area" box — type a city/locality and pick a match. */
export function AreaSearch({ near, onPick }: { near: LatLng; onPick: (name: string, location: LatLng) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (r: Result) => {
    setResults(null);
    setQuery(r.name.split(",")[0]);
    onPick(r.name.split(",").slice(0, 2).join(","), r.location);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}&lat=${near.lat}&lng=${near.lng}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Place search failed");
      if (!data.length) throw new Error("No place found with that name");
      if (data.length === 1) pick(data[0]);
      else setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Place search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full sm:w-auto">
      <form onSubmit={submit} className="flex gap-1">
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-base outline-none focus:border-teal-500 sm:w-52 sm:flex-none sm:py-1 sm:text-xs"
          placeholder="Search area (e.g. Virar West)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          disabled={loading}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "…" : "Go"}
        </button>
      </form>
      {error && (
        <p className="absolute left-0 z-[1200] mt-1 sm:left-auto sm:right-0 rounded bg-red-50 px-2 py-1 text-xs text-red-700">
          {error}
        </p>
      )}
      {results && (
        <ul className="absolute left-0 z-[1200] mt-1 w-full sm:left-auto sm:right-0 sm:w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((r) => (
            <li key={`${r.location.lat},${r.location.lng}`}>
              <button
                onClick={() => pick(r)}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-teal-50"
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
