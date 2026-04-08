import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRecipeById } from "../recipes";
import { calculateMacros } from "../utils/calculateMacros";
import { StructuredIngredient, Confidence } from "../types";
import { aiMatchAll, AiMatchResult } from "../utils/aiMatch";
import { fetchPersistedIngredients, saveIngredients } from "../utils/recipeApi";
import BudgetDisplay from "../components/BudgetDisplay";

const CONFIDENCE_COLOR: Record<Confidence, string> = {
  high:      "#166534",
  medium:    "#92400e",
  low:       "#991b1b",
  unmatched: "#6b7280",
};

const macroRow: React.CSSProperties = {
  display: "flex", gap: "2rem", margin: "0.25rem 0", fontSize: "0.9rem",
};
const macroLabel: React.CSSProperties = { width: 100, color: "#555" };

function r(n: number) { return Math.round(n); }

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe = getRecipeById(id!);

  // Ingredient state — starts from synchronous local pipeline,
  // upgraded with persisted DB data on mount (if available).
  const [ingredients, setIngredients] = useState<StructuredIngredient[]>(
    recipe?.ingredients ?? []
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(10);
  const [showBudget, setShowBudget] = useState(false);

  useEffect(() => {
    // Reset to local pipeline immediately (instant, no flash)
    const local = recipe?.ingredients ?? [];
    setIngredients(local);
    setAiLoading(false);
    setShowBudget(false);

    // Overlay with persisted data if the recipe has been AI-matched before
    fetchPersistedIngredients(id!)
      .then((persisted) => {
        if (persisted && persisted.length > 0) setIngredients(persisted);
      })
      .catch(() => {
        // DB unavailable or not configured — local state is fine
      });
  }, [id]); // id change causes recipe to change synchronously

  if (!recipe) return <p>Recipe not found.</p>;

  async function handleImproveWithAI() {
    setAiLoading(true);
    try {
      const raws = ingredients.map((ing) => ing.rawText);
      const aiResults = await aiMatchAll(raws, id);

      const byRaw: Record<string, AiMatchResult> = {};
      for (const result of aiResults) {
        byRaw[result.raw] = result;
        setBudgetUsed(result.budgetUsed);
        setBudgetLimit(result.budgetLimit);
        setShowBudget(true);
      }

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
    } finally {
      setAiLoading(false);
    }
  }

  // Macro totals recalculate live from current ingredient state
  const { total, perServing, unmatched } = calculateMacros({ ...recipe, ingredients });

  return (
    <div>
      <Link to="/">← Back</Link>
      <h1 style={{ marginTop: "1rem" }}>{recipe.title}</h1>
      <img
        src={recipe.image}
        alt={recipe.title}
        style={{ width: "100%", maxWidth: 320, borderRadius: 8, display: "block", margin: "1rem 0" }}
      />
      <p>Serves: {recipe.yield}</p>

      <h2>Ingredients</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {ingredients.map((ing, i) => (
          <li key={i} style={{ marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "0.9rem" }}>{ing.rawText}</span>
            {ing.matchedDescription && ing.confidence !== "unmatched" ? (
              <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.1rem" }}>
                → {ing.matchedDescription}
                <span style={{ marginLeft: "0.4rem", color: CONFIDENCE_COLOR[ing.confidence!], fontWeight: 500 }}>
                  [{ing.confidence}]
                </span>
                {ing.matchSource === "ai" && (
                  <span style={{ marginLeft: "0.3rem", color: "#6366f1", fontWeight: 600 }}>[AI]</span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.1rem" }}>
                {ing.phrase ? `no match — "${ing.phrase}"` : "could not parse"}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "0.75rem" }}>
        <button
          onClick={handleImproveWithAI}
          disabled={aiLoading}
          style={{
            padding: "0.3rem 0.9rem",
            fontSize: "0.82rem",
            cursor: aiLoading ? "default" : "pointer",
            opacity: aiLoading ? 0.6 : 1,
          }}
        >
          {aiLoading ? "Improving…" : "Improve with AI"}
        </button>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Nutrition (estimated)</h2>
      <div style={{ marginBottom: "0.25rem", fontSize: "0.8rem", color: "#888" }}>
        per serving / total recipe
      </div>
      <div style={macroRow}><span style={macroLabel}>Calories</span><span>{r(perServing.calories)} / {r(total.calories)} kcal</span></div>
      <div style={macroRow}><span style={macroLabel}>Protein</span> <span>{r(perServing.protein)} / {r(total.protein)} g</span></div>
      <div style={macroRow}><span style={macroLabel}>Carbs</span>   <span>{r(perServing.carbs)} / {r(total.carbs)} g</span></div>
      <div style={macroRow}><span style={macroLabel}>Fat</span>     <span>{r(perServing.fat)} / {r(total.fat)} g</span></div>

      {unmatched.length > 0 && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#888" }}>
          Not included in totals: {unmatched.join(", ")}
        </p>
      )}

      {showBudget && <BudgetDisplay spent={budgetUsed} limit={budgetLimit} />}
    </div>
  );
}
