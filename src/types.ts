// ── Shared primitive types ────────────────────────────────────────────────────

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Confidence = "high" | "medium" | "low" | "unmatched";
export type MatchSource = "manual" | "word-overlap" | "ai";

// ── Structured ingredient ─────────────────────────────────────────────────────
// rawText is always preserved for display; all other fields are derived.

export type StructuredIngredient = {
  rawText: string;              // original string — never modified, used for display
  quantity: number | null;      // numeric amount parsed from the string
  unit: string | null;          // unit as written ("g", "tbsp", "cup", …)
  grams: number | null;         // quantity converted to grams; null if unit unknown
  phrase: string | null;        // ingredient name, lowercase
  matchedFdcId: number | null;  // USDA FDC id of best match
  matchedDescription: string | null;
  confidence: Confidence | null;
  matchSource: MatchSource | null;
  reviewed: boolean;            // true once a human has confirmed the match
};

// ── Recipe types ──────────────────────────────────────────────────────────────

export type RecipeSummary = {
  id: string;
  title: string;
  yield: number;
  image: string;
};

export type Recipe = {
  id: string;
  title: string;
  yield: number;
  image: string;
  ingredients: StructuredIngredient[];
};
