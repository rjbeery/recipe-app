import { StructuredIngredient, Confidence } from "../types";
import { parseIngredient } from "./parseIngredient";
import { macroMap } from "./macroMap";
import { searchCandidates } from "./candidateSearch";

const EMPTY: Omit<StructuredIngredient, "rawText"> = {
  quantity: null,
  unit: null,
  grams: null,
  phrase: null,
  matchedFdcId: null,
  matchedDescription: null,
  confidence: null,
  matchSource: null,
  reviewed: false,
};

// Converts a raw ingredient string into a fully structured ingredient.
// Matching priority: exact manual map → word-overlap candidate search.
// rawText is always preserved unchanged.
export function structureIngredient(rawText: string): StructuredIngredient {
  const parsed = parseIngredient(rawText);
  if (!parsed) return { rawText, ...EMPTY };

  const base: StructuredIngredient = {
    rawText,
    quantity: parsed.quantity,
    unit: parsed.unit,
    grams: parsed.grams,
    phrase: parsed.phrase,
    matchedFdcId: null,
    matchedDescription: null,
    confidence: null,
    matchSource: null,
    reviewed: false,
  };

  // 1. Exact key in manual map → high confidence
  const manual = macroMap[parsed.phrase];
  if (manual) {
    return {
      ...base,
      matchedFdcId: manual.fdcId,
      matchedDescription: manual.description,
      confidence: "high",
      matchSource: "manual",
    };
  }

  // 2. Best candidate from word-overlap → medium / low / unmatched
  const candidates = searchCandidates(parsed.phrase, 1);
  if (candidates.length === 0) return { ...base, confidence: "unmatched" };

  const { entry, score } = candidates[0];
  const confidence: Confidence =
    score >= 0.75 ? "medium" : score >= 0.4 ? "low" : "unmatched";

  return {
    ...base,
    matchedFdcId: entry.fdcId,
    matchedDescription: entry.description,
    confidence,
    matchSource: "word-overlap",
  };
}
