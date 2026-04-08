import { macroLookup, LookupEntry } from "./macroLookup";

export type Candidate = {
  entry: LookupEntry;
  score: number; // 0–1, fraction of phrase words found in description
};

const STOPWORDS = new Set(["and", "with", "the", "raw", "fresh", "whole", "from", "made"]);

export function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Returns up to `limit` candidates sorted by word-overlap score descending.
// Score = (phrase words found in description) / (total phrase words).
export function searchCandidates(phrase: string, limit = 5): Candidate[] {
  const words = keywords(phrase);
  if (words.length === 0) return [];

  return macroLookup
    .map((entry) => {
      const desc = entry.description.toLowerCase();
      const hits = words.filter((w) => desc.includes(w)).length;
      return { entry, score: hits / words.length };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
