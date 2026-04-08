// Used by the ad hoc Estimate page — separate from the structured Recipe flow.
import { Confidence, MacroTotals } from "../types";
import { parseIngredient } from "./parseIngredient";
import { macroMap } from "./macroMap";
import { searchCandidates } from "./candidateSearch";
import { LookupEntry } from "./macroLookup";

export type { Confidence };

export type IngredientMatch = {
  raw: string;
  grams: number | null;
  phrase: string | null;
  fdcId: number | null;
  matchedDescription: string | null;
  confidence: Confidence;
  macros: MacroTotals | null;
};

function toMacros(entry: LookupEntry, grams: number): MacroTotals {
  const f = grams / 100;
  return {
    calories: entry.per100g.calories * f,
    protein:  entry.per100g.protein  * f,
    carbs:    entry.per100g.carbs    * f,
    fat:      entry.per100g.fat      * f,
  };
}

export function matchIngredient(raw: string): IngredientMatch {
  const parsed = parseIngredient(raw);
  if (!parsed) {
    return { raw, grams: null, phrase: null, fdcId: null, matchedDescription: null, confidence: "unmatched", macros: null };
  }

  const { grams, phrase } = parsed;

  // 1. Exact key in manual map → high
  const manual = macroMap[phrase];
  if (manual && grams != null) {
    return { raw, grams, phrase, fdcId: manual.fdcId, matchedDescription: manual.description, confidence: "high", macros: toMacros(manual, grams) };
  }

  // 2. Word-overlap via candidateSearch → medium / low / unmatched
  const top = searchCandidates(phrase, 1);
  if (top.length === 0 || grams == null) {
    return { raw, grams, phrase, fdcId: null, matchedDescription: null, confidence: "unmatched", macros: null };
  }

  const { entry, score } = top[0];
  const confidence: Confidence = score >= 0.75 ? "medium" : score >= 0.4 ? "low" : "unmatched";
  const macros = confidence !== "unmatched" ? toMacros(entry, grams) : null;

  return { raw, grams, phrase, fdcId: entry.fdcId, matchedDescription: entry.description, confidence, macros };
}

export function matchLines(text: string): IngredientMatch[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map(matchIngredient);
}
