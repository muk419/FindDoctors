import type { Degree } from "./types";

// Higher level = more specialised qualification.
const DEGREES: Record<string, number> = {
  DM: 5, MCH: 5, FRCS: 5, MRCP: 5, FRCP: 5, PHD: 5,
  MD: 4, MS: 4, DNB: 4, MDS: 4, DGO: 4, DCH: 4, DO: 3, DLO: 3,
  MBBS: 3, BDS: 3,
  BAMS: 2, BHMS: 2, BUMS: 2, BPT: 2, MPT: 2,
};

const PATTERN = new RegExp(
  `(?<![A-Za-z])(${Object.keys(DEGREES)
    .map((d) => (d === "MCH" ? "M\\.?\\s?Ch" : d.split("").join("\\.?")))
    .join("|")})\\.?(?![A-Za-z])`,
  "gi",
);

/**
 * Google Places has no "degree" field, so we extract qualifications that
 * doctors commonly put in their listing name/summary, e.g. "Dr. A Shah (MBBS, MD)".
 */
export function extractDegrees(...texts: (string | null | undefined)[]): Degree[] {
  const found = new Map<string, number>();
  for (const text of texts) {
    if (!text) continue;
    for (const m of text.matchAll(PATTERN)) {
      const code = m[1].replace(/[.\s]/g, "").toUpperCase();
      // "MS" / "DO" are also ordinary words — only accept them in upper case.
      if ((code === "MS" || code === "DO") && m[1] !== m[1].toUpperCase()) continue;
      if (code in DEGREES) found.set(code === "MCH" ? "MCh" : code, DEGREES[code]);
    }
  }
  return [...found].map(([code, level]) => ({ code, level })).sort((a, b) => b.level - a.level);
}

export function topDegreeLevel(degrees: Degree[]): number {
  return degrees[0]?.level ?? 0;
}
