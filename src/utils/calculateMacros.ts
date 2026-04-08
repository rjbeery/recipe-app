import { Recipe, MacroTotals } from "../types";
import { macroLookupById } from "./macroLookup";

export type { MacroTotals };

export type MacroResult = {
  total: MacroTotals;
  perServing: MacroTotals;
  unmatched: string[];
};

function scale(t: MacroTotals, divisor: number): MacroTotals {
  return { calories: t.calories / divisor, protein: t.protein / divisor, carbs: t.carbs / divisor, fat: t.fat / divisor };
}

export function calculateMacros(recipe: Recipe): MacroResult {
  const total: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const unmatched: string[] = [];

  for (const ing of recipe.ingredients) {
    if (!ing.matchedFdcId || !ing.grams || ing.confidence === "unmatched") {
      unmatched.push(ing.rawText);
      continue;
    }
    const entry = macroLookupById[ing.matchedFdcId];
    if (!entry) {
      unmatched.push(ing.rawText);
      continue;
    }
    const f = ing.grams / 100;
    total.calories += entry.per100g.calories * f;
    total.protein  += entry.per100g.protein  * f;
    total.carbs    += entry.per100g.carbs    * f;
    total.fat      += entry.per100g.fat      * f;
  }

  return { total, perServing: scale(total, recipe.yield), unmatched };
}
