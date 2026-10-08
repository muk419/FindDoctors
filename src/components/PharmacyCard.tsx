import type { Pharmacy } from "@/lib/types";
import { Stars } from "./Stars";

export function PharmacyCard({ pharmacy, onSelect }: { pharmacy: Pharmacy; onSelect: () => void }) {
  return (
    <div
      className={`rounded-xl border p-3 transition hover:shadow-md ${
        pharmacy.open24x7 ? "border-green-300 bg-green-50" : "border-slate-200 bg-white"
      }`}
    >
      <button onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">💊 {pharmacy.name}</h3>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {pharmacy.distanceKm} km
          </span>
        </div>
        {pharmacy.open24x7 && (
          <span className="mt-1 inline-block rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
            Open 24×7
          </span>
        )}
        <div className="mt-1">
          <Stars rating={pharmacy.rating} count={pharmacy.ratingCount} />
        </div>
        {pharmacy.address && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{pharmacy.address}</p>}
        {pharmacy.openingHours && !pharmacy.open24x7 && (
          <p className="mt-1 line-clamp-1 text-xs text-slate-600">🕒 {pharmacy.openingHours}</p>
        )}
      </button>
      {pharmacy.phone && (
        <a
          href={`tel:${pharmacy.phone}`}
          className="mt-2 inline-block rounded-lg border border-green-600 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
        >
          📞 Call {pharmacy.phone}
        </a>
      )}
    </div>
  );
}
