import { StructuredIngredient, Confidence, MatchSource, Recipe, RecipeSummary } from "../types";

// Maps the camelCase API response back to a StructuredIngredient.
// Handles the NUMERIC → string coercion Supabase applies to decimal columns.
function mapIngredient(row: any): StructuredIngredient {
  return {
    rawText: row.rawText,
    quantity: row.quantity != null ? Number(row.quantity) : null,
    unit: row.unit ?? null,
    grams: row.grams != null ? Number(row.grams) : null,
    phrase: row.phrase ?? null,
    matchedFdcId: row.matchedFdcId ?? null,
    matchedDescription: row.matchedDescription ?? null,
    confidence: (row.confidence as Confidence) ?? null,
    matchSource: (row.matchSource as MatchSource) ?? null,
    reviewed: row.reviewed ?? false,
  };
}

/**
 * Fetches all recipes from the database.
 * Returns null if the server is unavailable.
 */
export async function fetchRecipes(): Promise<RecipeSummary[] | null> {
  const res = await fetch("/api/recipes");
  if (!res.ok) return null;
  return res.json();
}

/**
 * Fetches a single recipe's metadata from the database.
 * Returns null if not found, throws on other errors.
 */
export async function fetchRecipeById(recipeId: string): Promise<Recipe | null> {
  const res = await fetch(`/api/recipes/${recipeId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Recipe fetch failed: ${res.status}`);
  const data = await res.json();
  return { ...data, ingredients: [] };
}

/**
 * Fetches persisted ingredient matches for a recipe.
 * Returns null if the recipe has no persisted data yet (first visit).
 */
export async function fetchPersistedIngredients(
  recipeId: string
): Promise<StructuredIngredient[] | null> {
  const res = await fetch(`/api/recipes/${recipeId}/ingredients`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Ingredient fetch failed: ${res.status}`);
  const data: any[] = await res.json();
  return data.map(mapIngredient);
}

/**
 * Deletes a recipe and its ingredient rows from the backend.
 */
export async function deleteRecipe(recipeId: string): Promise<void> {
  const res = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Recipe delete failed: ${res.status}`);
}

/**
 * Persists current ingredient state for a recipe (upsert).
 * Fire-and-forget safe — callers should catch errors.
 */
export async function saveIngredients(
  recipe: Recipe,
  ingredients: StructuredIngredient[]
): Promise<void> {
  const res = await fetch(`/api/recipes/${recipe.id}/ingredients`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: recipe.title,
      yieldServings: recipe.yield,
      imagePath: recipe.image,
      ingredients,
    }),
  });
  if (!res.ok) {
    throw new Error(`Ingredient save failed: ${res.status}`);
  }
}
