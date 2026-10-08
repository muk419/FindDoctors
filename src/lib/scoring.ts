// Bayesian average: one 5★ vote should not beat a 4.6★ from 40 people.
const PRIOR_MEAN = 3.8;
const PRIOR_WEIGHT = 3;

export function weightedRating(rating: number | null, count: number): number {
  if (rating == null || count === 0) return PRIOR_MEAN;
  return (rating * count + PRIOR_MEAN * PRIOR_WEIGHT) / (count + PRIOR_WEIGHT);
}

/** 0..1, closer is better; anything beyond maxKm scores 0. */
export function proximity(distanceKm: number, maxKm: number): number {
  return Math.max(0, 1 - distanceKm / maxKm);
}

export function doctorScore(opts: {
  rating: number | null;
  ratingCount: number;
  degreeLevel: number;
  distanceKm: number;
  radiusKm: number;
}): number {
  const r = weightedRating(opts.rating, opts.ratingCount) / 5;
  const d = opts.degreeLevel / 5;
  const p = proximity(opts.distanceKm, opts.radiusKm);
  return Math.round((r * 0.55 + d * 0.25 + p * 0.2) * 100);
}
