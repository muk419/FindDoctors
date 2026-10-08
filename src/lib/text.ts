/**
 * Spelling-tolerant matching for Indian names typed in English, where the
 * same name is often written several ways: Ridhi / Riddhi, Vinayak / Vinayaka,
 * Shree / Shri / Sri, Lilavati / Leelavati.
 */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/w/g, "v")
    .replace(/ph/g, "f")
    .replace(/sh/g, "s")
    .replace(/(?<=[bcdfghjklmnpqrstvxz])h/g, "") // dh→d, th→t, kh→k, bh→b …
    .replace(/(.)\1+/g, "$1") // dd→d, aa→a
    .replace(/a$/, ""); // Vinayaka → vinayak
}

const words = (text: string) => text.split(/[^A-Za-z0-9]+/).map(normalizeWord).filter(Boolean);

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function wordMatches(q: string, w: string): boolean {
  if (w.startsWith(q)) return true; // lets people type part of a word
  if (q.length >= 5) return editDistance(q, w) <= 1; // one typo allowed in longer words
  return false;
}

/** True if every word of the query matches some word of the text. */
export function fuzzyIncludes(query: string, text: string): boolean {
  const q = words(query).filter((w) => !/^(dr|doctor|hospital|clinic)$/.test(w));
  if (!q.length) return true;
  const t = words(text);
  return q.every((qw) => t.some((tw) => wordMatches(qw, tw)));
}
