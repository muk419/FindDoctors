"use client";

import { useState } from "react";
import { SPECIALTIES } from "@/lib/specialties";
import type { SortBy } from "@/lib/types";

export type Filters = {
  name: string;
  disease: string;
  specialty: string;
  radiusKm: number;
  minRating: number;
  sortBy: SortBy;
};

export const DEFAULT_FILTERS: Filters = {
  name: "",
  disease: "",
  specialty: "",
  radiusKm: 10,
  minRating: 0,
  sortBy: "best",
};

// text-base on phones stops iOS from zooming into the field on focus.
const input =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:text-sm";
const label = "flex flex-col gap-1 text-xs text-slate-600 sm:flex-row sm:items-center sm:gap-2 sm:text-sm";

export function SearchForm({
  filters,
  onChange,
  onSubmit,
  loading,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  // On phones the extra filters fold away behind a button; on larger screens they're always shown.
  const [showFilters, setShowFilters] = useState(false);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  const activeFilters = [
    filters.specialty !== DEFAULT_FILTERS.specialty,
    filters.radiusKm !== DEFAULT_FILTERS.radiusKm,
    filters.minRating !== DEFAULT_FILTERS.minRating,
    filters.sortBy !== DEFAULT_FILTERS.sortBy,
  ].filter(Boolean).length;

  return (
    <form
      className="flex flex-col gap-2 sm:gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setShowFilters(false);
        onSubmit();
      }}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input
          className={input}
          placeholder="Doctor name"
          aria-label="Doctor name"
          value={filters.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <input
          className={input}
          placeholder="Disease or symptom"
          aria-label="Disease or symptom"
          value={filters.disease}
          onChange={(e) => set("disease", e.target.value)}
        />
        <select
          className={`${input} col-span-2 sm:col-span-1 ${showFilters ? "" : "hidden"} sm:block`}
          aria-label="Specialty"
          value={filters.specialty}
          onChange={(e) => set("specialty", e.target.value)}
        >
          <option value="">Any specialty</option>
          {SPECIALTIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 sm:hidden"
        >
          ⚙️ Filters
          {activeFilters > 0 && (
            <span className="rounded-full bg-teal-600 px-1.5 text-xs text-white">{activeFilters}</span>
          )}
          <span className={`text-xs transition ${showFilters ? "rotate-180" : ""}`}>▾</span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Searching…" : "🔎 Search"}
        </button>
      </div>

      <div
        className={`${showFilters ? "grid" : "hidden"} grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2`}
      >
        <label className={label}>
          Within
          <select className={input} value={filters.radiusKm} onChange={(e) => set("radiusKm", +e.target.value)}>
            {[2, 5, 10, 15, 25, 50].map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Rating
          <select className={input} value={filters.minRating} onChange={(e) => set("minRating", +e.target.value)}>
            <option value={0}>Any</option>
            <option value={3.5}>3.5+ ★</option>
            <option value={4}>4.0+ ★</option>
            <option value={4.5}>4.5+ ★</option>
          </select>
        </label>
        <label className={label}>
          Sort
          <select className={input} value={filters.sortBy} onChange={(e) => set("sortBy", e.target.value as SortBy)}>
            <option value="best">Best match</option>
            <option value="rating">Highest rated</option>
            <option value="distance">Nearest</option>
          </select>
        </label>
      </div>
    </form>
  );
}
