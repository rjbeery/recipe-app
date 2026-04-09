import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { getRecipeById, addRecipe } from "../recipes";
import { calculateMacros } from "../utils/calculateMacros";
import { macroLookupById } from "../utils/macroLookup";
import { StructuredIngredient, Confidence, MacroTotals, Recipe } from "../types";
import { aiMatchAll, AiMatchResult } from "../utils/aiMatch";
import { fetchPersistedIngredients, fetchRecipeById, saveIngredients } from "../utils/recipeApi";
import type { AppShellContext } from "../App";

const CONFIDENCE_COLOR: Record<Confidence, string> = {
  high:      "#166534",
  medium:    "#92400e",
  low:       "#991b1b",
  unmatched: "#6b7280",
};

function r(n: number) { return Math.round(n); }

function ingredientMacros(ing: StructuredIngredient): MacroTotals | null {
  if (!ing.matchedFdcId || !ing.grams || ing.confidence === "unmatched") return null;
  const entry = macroLookupById[ing.matchedFdcId];
  if (!entry) return null;
  const f = ing.grams / 100;
  return { calories: entry.per100g.calories * f, protein: entry.per100g.protein * f, carbs: entry.per100g.carbs * f, fat: entry.per100g.fat * f };
}

const MATCH_EXPLANATION: Record<string, string> = {
  manual:        "Exact match from curated ingredient map",
  "word-overlap": "Matched based on keyword similarity",
  ai:            "AI-assisted match",
};

const SOURCE_LABEL: Record<string, string> = {
  manual:        "Curated",
  "word-overlap": "Heuristic",
  ai:            "AI assisted",
};

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { refreshBudget } = useOutletContext<AppShellContext>();

  const [recipe, setRecipe] = useState<Recipe | null>(() => getRecipeById(id!) ?? null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(!getRecipeById(id!));
  const [recipeError, setRecipeError] = useState(false);

  // Ingredient state — starts from synchronous local pipeline,
  // upgraded with persisted DB data on mount (if available).
  const [ingredients, setIngredients] = useState<StructuredIngredient[]>(
    () => getRecipeById(id!)?.ingredients ?? []
  );
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateDone, setEstimateDone] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  useEffect(() => {
    setIsEstimating(false);
    setEstimateDone(false);
    setEstimateError(null);
    setRecipeError(false);

    async function load() {
      const local = getRecipeById(id!) ?? null;

      if (local) {
        setRecipe(local);
        setIngredients(local.ingredients);
        setIsLoadingRecipe(false);
      } else {
        // Recipe not in local store (e.g. after page refresh) — fetch metadata from DB.
        setIsLoadingRecipe(true);
        try {
          const fetched = await fetchRecipeById(id!);
          if (!fetched) {
            setRecipeError(true);
            return;
          }
          addRecipe(fetched); // hydrate in-memory store for this session
          setRecipe(fetched);
          setIngredients(fetched.ingredients);
        } catch {
          setRecipeError(true);
          return;
        } finally {
          setIsLoadingRecipe(false);
        }
      }

      // Hydrate with persisted matches — restores prior AI matches so estimation
      // does not need to re-run. Only reveal summary if at least one is matched.
      try {
        const persisted = await fetchPersistedIngredients(id!);
        if (persisted && persisted.length > 0) {
          setIngredients(persisted);
          if (persisted.some((ing) => ing.matchedFdcId !== null)) {
            setEstimateDone(true);
          }
        }
      } catch {
        // DB unavailable — local state is fine
      }
    }

    load();
  }, [id]);

  if (isLoadingRecipe) return <p>Loading…</p>;
  if (recipeError || !recipe) return <p style={{ color: "#991b1b" }}>Recipe not found.</p>;

  async function handleEstimate() {
    if (!recipe) return;
    setEstimateError(null);

    // Skip ingredients that already have a persisted AI match — avoids repeated
    // AI cost and keeps results consistent with what was previously saved.
    const needsAi = ingredients.filter((ing) => ing.matchSource !== "ai");

    setIsEstimating(true);
    try {
      if (needsAi.length > 0) {
        const raws = needsAi.map((ing) => ing.rawText);
        const aiResults = await aiMatchAll(raws, id);

        const byRaw: Record<string, AiMatchResult> = {};
        for (const result of aiResults) byRaw[result.raw] = result;

        // Compute updated ingredients once — used for both state and DB save
        const updated = ingredients.map((ing) => {
          const ai = byRaw[ing.rawText];
          if (!ai || ai.budgetExhausted) return ing;
          return {
            ...ing,
            matchedFdcId: ai.matchedFdcId,
            matchedDescription: ai.matchedDescription,
            confidence: ai.confidence,
            matchSource: "ai" as const,
          };
        });

        setIngredients(updated);

        // Persist to DB (fire-and-forget — don't block the UI)
        saveIngredients(recipe, updated).catch(console.error);
      }

      setEstimateDone(true);
    } catch {
      setEstimateError("Estimation failed. Please try again.");
    } finally {
      setIsEstimating(false);
      // Re-fetch budget from server so header reflects accurate post-estimation spend
      refreshBudget();
    }
  }

  // Macro totals recalculate live from current ingredient state
  const { total, perServing, unmatched } = calculateMacros({ ...recipe, ingredients });

  return (
    <div>
      <h1>{recipe.title}</h1>
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          style={{ width: "100%", maxWidth: 320, borderRadius: 8, display: "block", margin: "1rem 0" }}
        />
      )}
      <p style={{ margin: "0.25rem 0 0.75rem" }}>Serves: {recipe.yield}</p>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={handleEstimate}
          disabled={isEstimating}
          style={{
            padding: "0.4rem 1rem",
            fontSize: "0.88rem",
            cursor: isEstimating ? "default" : "pointer",
            opacity: isEstimating ? 0.6 : 1,
          }}
        >
          {isEstimating ? "Estimating…" : "Estimate macronutrients"}
        </button>
        {estimateError && (
          <p style={{ color: "#991b1b", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>
            {estimateError}
          </p>
        )}
      </div>

      {estimateDone && (
        <div style={{ margin: "0 0 1.25rem", padding: "0.75rem", background: "#f9fafb", borderRadius: 6, fontSize: "0.88rem" }}>
          <strong style={{ display: "block", marginBottom: "0.4rem" }}>Nutrition (estimated)</strong>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <span><strong>{r(perServing.calories)}</strong> kcal / serving &nbsp;·&nbsp; <strong>{r(total.calories)}</strong> kcal total</span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "0.25rem", color: "#444" }}>
            <span>Protein: {r(perServing.protein)}g / {r(total.protein)}g</span>
            <span>Carbs: {r(perServing.carbs)}g / {r(total.carbs)}g</span>
            <span>Fat: {r(perServing.fat)}g / {r(total.fat)}g</span>
          </div>
          {unmatched.length > 0 && (
            <div style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "#9ca3af" }}>
              Totals reflect matched ingredients only.
            </div>
          )}
        </div>
      )}

      <h2 style={{ margin: "0 0 0.5rem" }}>Ingredients</h2>
      <div style={{ margin: "0 0 0.75rem", padding: "0.6rem 0.75rem", background: "#f9fafb", borderRadius: 6, fontSize: "0.78rem", color: "#6b7280" }}>
        <strong style={{ display: "block", marginBottom: "0.2rem", color: "#374151" }}>How matching works</strong>
        Ingredients keep their original recipe wording. The system first tries curated matches, then heuristic search, and uses AI only as a constrained fallback against USDA candidates.
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {ingredients.map((ing, i) => {
          const macros = estimateDone ? ingredientMacros(ing) : null;
          const matched = estimateDone && ing.matchedDescription && ing.confidence !== "unmatched";
          return (
            <li key={i} style={{ marginBottom: "0.6rem" }}>
              {/* 1. Original ingredient text — always visible */}
              <span style={{ fontSize: "0.9rem" }}>{ing.rawText}</span>

              {/* Match details only appear after estimation runs */}
              {estimateDone && (matched ? (
                <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.1rem" }}>
                  {/* 2. Matched USDA description */}
                  → {ing.matchedDescription}
                  {/* 3. Source label */}
                  {ing.matchSource && (
                    <span style={{ marginLeft: "0.4rem", color: "#9ca3af", fontSize: "0.72rem" }}>
                      {SOURCE_LABEL[ing.matchSource]}
                    </span>
                  )}
                  {/* 4. Confidence */}
                  <span style={{ marginLeft: "0.4rem", color: CONFIDENCE_COLOR[ing.confidence!], fontWeight: 500 }}>
                    [{ing.confidence}]
                  </span>
                  {/* 5. Explanation */}
                  {ing.matchSource && (
                    <div style={{ color: "#9ca3af", fontStyle: "italic", marginTop: "0.1rem" }}>
                      {MATCH_EXPLANATION[ing.matchSource]}
                    </div>
                  )}
                  {/* 6. Per-ingredient macros */}
                  {macros && (
                    <div style={{ color: "#555", marginTop: "0.1rem" }}>
                      {r(macros.calories)} kcal · {r(macros.protein)}g protein · {r(macros.carbs)}g carbs · {r(macros.fat)}g fat
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.1rem" }}>
                  {ing.phrase ? `no match — "${ing.phrase}"` : "could not parse"}
                </div>
              ))}
            </li>
          );
        })}
      </ul>

    </div>
  );
}
