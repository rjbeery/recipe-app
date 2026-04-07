import { Recipe, RecipeSummary } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export async function fetchRecipes(): Promise<RecipeSummary[]> {
  const res = await fetch(`${BASE_URL}/recipes`);
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/recipes/${id}`);
  if (!res.ok) throw new Error("Recipe not found");
  return res.json();
}
