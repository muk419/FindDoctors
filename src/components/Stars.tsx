export function Stars({ rating, count }: { rating: number | null; count: number }) {
  if (rating == null) return <span className="text-xs text-slate-400">Not rated yet</span>;
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="font-semibold text-amber-600">{rating.toFixed(1)}</span>
      <span className="text-amber-500" aria-hidden>
        {"★".repeat(Math.round(rating))}
        <span className="text-slate-300">{"★".repeat(5 - Math.round(rating))}</span>
      </span>
      <span className="text-xs text-slate-500">
        ({count} rating{count === 1 ? "" : "s"})
      </span>
    </span>
  );
}
