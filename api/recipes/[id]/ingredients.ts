// GET  /api/recipes/:id/ingredients — returns persisted structured ingredients
// PUT  /api/recipes/:id/ingredients — upserts recipe + all ingredient rows

import { getDb } from "../../_db.js";

type IngredientRow = {
  recipe_id: string;
  sort_order: number;
  raw_text: string;
  quantity: number | null;
  unit: string | null;
  grams: number | null;
  phrase: string | null;
  matched_fdc_id: number | null;
  matched_description: string | null;
  confidence: string | null;
  match_source: string | null;
  reviewed: boolean;
};

type PutBody = {
  title: string;
  yieldServings: number;
  imagePath: string;
  ingredients: Array<{
    rawText: string;
    quantity: number | null;
    unit: string | null;
    grams: number | null;
    phrase: string | null;
    matchedFdcId: number | null;
    matchedDescription: string | null;
    confidence: string | null;
    matchSource: string | null;
    reviewed: boolean;
  }>;
};

export default async function handler(req: any, res: any) {
  const recipeId: string = req.query.id;
  const db = getDb();

  // ── GET ──────────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { data, error } = await db
      .from("recipe_ingredients")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("sort_order");

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No persisted ingredients for this recipe." });
    }

    // Map snake_case DB rows to camelCase StructuredIngredient shape
    const ingredients = (data as IngredientRow[]).map((row) => ({
      rawText: row.raw_text,
      quantity: row.quantity != null ? Number(row.quantity) : null,
      unit: row.unit ?? null,
      grams: row.grams != null ? Number(row.grams) : null,
      phrase: row.phrase ?? null,
      matchedFdcId: row.matched_fdc_id ?? null,
      matchedDescription: row.matched_description ?? null,
      confidence: row.confidence ?? null,
      matchSource: row.match_source ?? null,
      reviewed: row.reviewed,
    }));

    return res.status(200).json(ingredients);
  }

  // ── PUT ──────────────────────────────────────────────────────────────────────
  if (req.method === "PUT") {
    const { title, yieldServings, imagePath, ingredients } = req.body as PutBody;

    if (!title || !ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Upsert the recipe row first (satisfies FK constraint)
    const { error: recipeErr } = await db.from("recipes").upsert(
      { id: recipeId, title, yield_servings: yieldServings, image_path: imagePath },
      { onConflict: "id" }
    );
    if (recipeErr) {
      return res.status(500).json({ error: `Recipe upsert failed: ${recipeErr.message}` });
    }

    // Build ingredient rows
    const rows = ingredients.map((ing, i) => ({
      recipe_id: recipeId,
      sort_order: i,
      raw_text: ing.rawText,
      quantity: ing.quantity,
      unit: ing.unit,
      grams: ing.grams,
      phrase: ing.phrase,
      matched_fdc_id: ing.matchedFdcId,
      matched_description: ing.matchedDescription,
      confidence: ing.confidence,
      match_source: ing.matchSource,
      reviewed: ing.reviewed,
    }));

    const { error: ingErr } = await db
      .from("recipe_ingredients")
      .upsert(rows, { onConflict: "recipe_id,sort_order" });

    if (ingErr) {
      return res.status(500).json({ error: `Ingredient upsert failed: ${ingErr.message}` });
    }

    return res.status(200).json({ saved: ingredients.length });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
