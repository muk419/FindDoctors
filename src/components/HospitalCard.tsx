import type { Hospital } from "@/lib/types";
import { Stars } from "./Stars";

export function HospitalCard({
  hospital,
  recommended,
  selected,
  onSelect,
}: {
  hospital: Hospital;
  recommended: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition hover:shadow-md ${
        selected
          ? "border-rose-500 bg-rose-50 ring-2 ring-rose-100"
          : recommended
            ? "border-amber-400 bg-amber-50"
            : "border-slate-200 bg-white"
      }`}
    >
      {recommended && (
        <span className="mb-1 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
          ⭐ Recommended for you
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{hospital.name}</h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {hospital.distanceKm} km
        </span>
      </div>
      <div className="mt-1">
        <Stars rating={hospital.rating} count={hospital.ratingCount} />
      </div>
      {hospital.address && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{hospital.address}</p>}
      {hospital.specialties.length > 0 && (
        <p className="mt-1 line-clamp-1 text-xs text-indigo-700">{hospital.specialties.join(" · ")}</p>
      )}
      {hospital.reasons.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-slate-700">
          {hospital.reasons.map((r) => (
            <li key={r}>✓ {r}</li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-slate-400">Hospital score {hospital.score}/100</p>
    </button>
  );
}
