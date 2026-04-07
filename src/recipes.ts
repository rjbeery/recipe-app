import { recipes } from "./data";
import { Recipe, RecipeSummary } from "./types";

export function getAllRecipes(): RecipeSummary[] {
  return recipes.map(({ ingredients: _, ...summary }) => summary);
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}
