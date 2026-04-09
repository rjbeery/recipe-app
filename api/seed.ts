// One-time seeding endpoint: POST /api/seed
// Idempotent — safe to run multiple times.
// Seeds the recipes and recipe_ingredients tables from the canonical raw data.
// Match fields start null; they are populated by the local pipeline or AI on first use.

import { getDb } from "./_db.js";

const RAW_RECIPES = [
  {
    id: "chicken-stir-fry",
    title: "Chicken Stir-Fry",
    yield_servings: 2,
    image_path: "/images/chicken-stir-fry.png",
    ingredients: [
      "30g olive oil",
      "200g chicken breast",
      "500g broccoli florets",
      "250g red bell pepper",
      "60g soy sauce",
      "10g garlic",
      "5g ginger",
    ],
  },
  {
    id: "veggie-omelette",
    title: "Veggie Omelette",
    yield_servings: 1,
    image_path: "/images/veggie-omelette.png",
    ingredients: [
      "100g large eggs",
      "40g diced onion",
      "50g diced tomato",
      "20g spinach leaves",
      "15g olive oil",
      "150g small corn tortillas",
      "3g Salt and pepper (to taste)",
    ],
  },
  {
    id: "overnight-oats",
    title: "Overnight Oats",
    yield_servings: 4,
    image_path: "/images/overnight-oats.png",
    ingredients: [
      "160g rolled oats",
      "1000g almond milk",
      "70g chia seeds",
      "60g honey",
      "300g blueberries",
    ],
  },
];

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const results: string[] = [];

  for (const recipe of RAW_RECIPES) {
    // Upsert recipe row
    const { error: recipeErr } = await db.from("recipes").upsert(
      {
        id: recipe.id,
        title: recipe.title,
        yield_servings: recipe.yield_servings,
        image_path: recipe.image_path,
      },
      { onConflict: "id" }
    );

    if (recipeErr) {
      return res.status(500).json({ error: `Recipe upsert failed for ${recipe.id}: ${recipeErr.message}` });
    }

    // Upsert ingredient rows (raw_text only; match fields left null)
    const rows = recipe.ingredients.map((raw_text, i) => ({
      recipe_id: recipe.id,
      sort_order: i,
      raw_text,
    }));

    const { error: ingErr } = await db
      .from("recipe_ingredients")
      .upsert(rows, { onConflict: "recipe_id,sort_order", ignoreDuplicates: true });

    if (ingErr) {
      return res.status(500).json({ error: `Ingredient upsert failed for ${recipe.id}: ${ingErr.message}` });
    }

    results.push(recipe.id);
  }

  return res.status(200).json({ seeded: results });
}
