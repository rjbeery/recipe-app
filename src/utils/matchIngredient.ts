import { parseIngredient } from "./parseIngredient";
import { macroMap } from "./macroMap";
import { macroLookup, LookupEntry } from "./macroLookup";
import { MacroTotals } from "./calculateMacros";

export type Confidence = "high" | "medium" | "low" | "unmatched";

export type IngredientMatch = {
  raw: string;
  grams: number | null;
  phrase: string | null;
  fdcId: number | null;
  matchedDescription: string | null;
  confidence: Confidence;
  macros: MacroTotals | null;
};

// Returns words longer than 2 chars, excluding noise words
const STOPWORDS = new Set(["and", "with", "the", "raw", "fresh", "whole", "from", "made"]);

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function wordOverlapScore(phraseWords: string[], entry: LookupEntry): number {
  if (phraseWords.length === 0) return 0;
  const desc = entry.description.toLowerCase();
  const hits = phraseWords.filter((w) => desc.includes(w)).length;
  return hits / phraseWords.length;
}

function toMacros(entry: { per100g: MacroTotals }, grams: number): MacroTotals {
  const f = grams / 100;
  return {
    calories: entry.per100g.calories * f,
    protein:  entry.per100g.protein  * f,
    carbs:    entry.per100g.carbs    * f,
    fat:      entry.per100g.fat      * f,
  };
}

export function matchIngredient(raw: string): IngredientMatch {
  const base: Pick<IngredientMatch, "raw"> = { raw };

  const parsed = parseIngredient(raw);
  if (!parsed) {
    return { ...base, grams: null, phrase: null, fdcId: null, matchedDescription: null, confidence: "unmatched", macros: null };
  }

  const { grams, phrase } = parsed;

  // 1. Exact key match in manual map → high confidence
  const exact = macroMap[phrase];
  if (exact) {
    return {
      raw,
      grams,
      phrase,
      fdcId: exact.fdcId,
      matchedDescription: exact.description,
      confidence: "high",
      macros: toMacros(exact, grams),
    };
  }

  // 2. Word-overlap against lookup table → medium / low / unmatched
  const words = keywords(phrase);
  let bestScore = 0;
  let bestEntry: LookupEntry | null = null;

  for (const entry of macroLookup) {
    const score = wordOverlapScore(words, entry);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (!bestEntry || bestScore === 0) {
    return { raw, grams, phrase, fdcId: null, matchedDescription: null, confidence: "unmatched", macros: null };
  }

  const confidence: Confidence = bestScore >= 0.75 ? "medium" : "low";

  return {
    raw,
    grams,
    phrase,
    fdcId: bestEntry.fdcId,
    matchedDescription: bestEntry.description,
    confidence,
    macros: toMacros(bestEntry, grams),
  };
}

export function matchLines(text: string): IngredientMatch[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map(matchIngredient);
}
