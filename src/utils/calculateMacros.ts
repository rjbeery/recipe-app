import { Recipe } from "../types";
import { parseIngredient } from "./parseIngredient";
import { macroMap } from "./macroMap";

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MacroResult = {
  total: MacroTotals;
  perServing: MacroTotals;
  unmatched: string[]; // raw ingredient strings that could not be mapped
};

function scale(totals: MacroTotals, divisor: number): MacroTotals {
  return {
    calories: totals.calories / divisor,
    protein: totals.protein / divisor,
    carbs: totals.carbs / divisor,
    fat: totals.fat / divisor,
  };
}

export function calculateMacros(recipe: Recipe): MacroResult {
  const total: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const unmatched: string[] = [];

  for (const raw of recipe.ingredients) {
    const parsed = parseIngredient(raw);
    if (!parsed) {
      unmatched.push(raw);
      continue;
    }

    const entry = macroMap[parsed.phrase];
    if (!entry) {
      unmatched.push(raw);
      continue;
    }

    const factor = parsed.grams / 100;
    total.calories += entry.per100g.calories * factor;
    total.protein  += entry.per100g.protein  * factor;
    total.carbs    += entry.per100g.carbs    * factor;
    total.fat      += entry.per100g.fat      * factor;
  }

  return {
    total,
    perServing: scale(total, recipe.yield),
    unmatched,
  };
}
