"use client";

import { useEffect, useState } from "react";
import type { RatingSummary } from "@/lib/types";

const VOTER_KEY = "finddoctor-voter-id";

function voterId(): string {
  try {
    let id = localStorage.getItem(VOTER_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VOTER_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Lets the user give a place 1–5 stars; one vote per browser, can be changed. */
export function RateStars({ placeId, onRated }: { placeId: string; onRated: (summary: RatingSummary) => void }) {
  const [myVote, setMyVote] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ratings?placeId=${encodeURIComponent(placeId)}&voterId=${voterId()}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setMyVote(d.myVote ?? null))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  async function submit(stars: number) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, voterId: voterId(), stars }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save rating");
      setMyVote(stars);
      onRated({ average: data.average, count: data.count });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save rating");
    } finally {
      setSaving(false);
    }
  }

  const shown = hover || myVote || 0;
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-sm font-medium text-slate-700">{myVote ? "Your rating" : "Visited? Rate this place"}</p>
      <div className="mt-1 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={saving}
            onMouseEnter={() => setHover(n)}
            onClick={() => submit(n)}
            className={`text-2xl leading-none transition ${n <= shown ? "text-amber-500" : "text-slate-300"} hover:scale-110`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
        {saving && <span className="ml-2 text-xs text-slate-500">Saving…</span>}
        {!saving && myVote && <span className="ml-2 text-xs text-green-700">Thanks!</span>}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
