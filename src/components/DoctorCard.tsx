import type { Doctor } from "@/lib/types";
import { Stars } from "./Stars";

export function DoctorCard({
  doctor,
  selected,
  onSelect,
}: {
  doctor: Doctor;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition hover:shadow-md ${
        selected ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {doctor.distanceKm} km
        </span>
      </div>
      <p className="text-xs text-slate-500">{[doctor.kind, ...doctor.specialties].join(" · ")}</p>
      <div className="mt-1">
        <Stars rating={doctor.rating} count={doctor.ratingCount} />
      </div>
      {doctor.degrees.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {doctor.degrees.map((d) => (
            <span key={d.code} className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
              {d.code}
            </span>
          ))}
        </div>
      )}
      {doctor.hospital && (
        <p className="mt-2 text-sm text-slate-700">
          🏥 <span className="font-medium">{doctor.hospital.name}</span>
        </p>
      )}
      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{doctor.address}</p>
      <div className="mt-2 flex items-center gap-3 text-xs">
        {doctor.openingHours && <span className="line-clamp-1 text-slate-600">🕒 {doctor.openingHours}</span>}
        <span className="shrink-0 text-slate-400">Match score {doctor.score}</span>
      </div>
    </button>
  );
}
