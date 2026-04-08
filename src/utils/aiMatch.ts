import { parseIngredient } from "./parseIngredient";
import { searchCandidates } from "./candidateSearch";
import { Confidence } from "../types";

export type AiMatchResponse = {
  matchedFdcId: number | null;
  matchedDescription: string | null;
  confidence: Confidence;
  reason: string;
  estimatedCost: number;
  budgetUsed: number;
  budgetLimit: number;
  budgetExhausted: boolean;
};

export type AiMatchResult = AiMatchResponse & { raw: string };

export async function aiMatchIngredient(raw: string): Promise<AiMatchResult | null> {
  const parsed = parseIngredient(raw);
  if (!parsed || parsed.grams == null) return null;

  const candidates = searchCandidates(parsed.phrase, 5).map((c) => ({
    fdcId: c.entry.fdcId,
    description: c.entry.description,
    score: c.score,
  }));

  const res = await fetch("/api/match-ingredient", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phrase: parsed.phrase, grams: parsed.grams, candidates }),
  });

  if (!res.ok) throw new Error(`AI match failed: ${res.status}`);
  const data: AiMatchResponse = await res.json();
  return { raw, ...data };
}

// Runs aiMatchIngredient for all raws in parallel; silently skips failures.
export async function aiMatchAll(raws: string[]): Promise<AiMatchResult[]> {
  const settled = await Promise.allSettled(raws.map(aiMatchIngredient));
  return settled
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((r): r is AiMatchResult => r !== null);
}
