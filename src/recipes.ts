import { recipeData } from "./data";
import { Recipe, RecipeSummary } from "./types";
import { structureIngredient } from "./utils/structureIngredient";

// In-memory store for user-created recipes (cleared on page refresh).
// Keeps the data layer simple without requiring a full state manager.
const dynamicRecipes = new Map<string, Recipe>();
const deletedIds = new Set<string>();

export function addRecipe(recipe: Recipe): void {
  dynamicRecipes.set(recipe.id, recipe);
}

export function removeRecipe(id: string): void {
  dynamicRecipes.delete(id);
  deletedIds.add(id); // also suppresses static recipes that have been deleted
}

export function getAllRecipes(): RecipeSummary[] {
  const staticSummaries = recipeData
    .filter((r) => !deletedIds.has(r.id))
    .map(({ ingredients: _, ...summary }) => summary);
  const dynamicSummaries = [...dynamicRecipes.values()].map(
    ({ ingredients: _, ...summary }) => summary
  );
  return [...staticSummaries, ...dynamicSummaries];
}

export function getRecipeById(id: string): Recipe | undefined {
  // Check dynamic store first (user-created recipes are already structured)
  if (dynamicRecipes.has(id)) return dynamicRecipes.get(id);

  const raw = recipeData.find((r) => r.id === id);
  if (!raw) return undefined;
  return {
    ...raw,
    ingredients: raw.ingredients.map(structureIngredient),
  };
}
