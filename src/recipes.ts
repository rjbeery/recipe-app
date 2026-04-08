import { recipeData } from "./data";
import { Recipe, RecipeSummary } from "./types";
import { structureIngredient } from "./utils/structureIngredient";

export function getAllRecipes(): RecipeSummary[] {
  return recipeData.map(({ ingredients: _, ...summary }) => summary);
}

export function getRecipeById(id: string): Recipe | undefined {
  const raw = recipeData.find((r) => r.id === id);
  if (!raw) return undefined;
  return {
    ...raw,
    ingredients: raw.ingredients.map(structureIngredient),
  };
}
