// Macro data extracted from USDA FDC database (macro.csv).
// All values are per 100g.
// Keys match the lowercase ingredient phrase produced by parseIngredient.

export type MacroEntry = {
  fdcId: number;
  description: string; // original USDA description
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

export const macroMap: Record<string, MacroEntry> = {
  "olive oil": {
    fdcId: 2345743,
    description: "Olive oil",
    per100g: { calories: 900, protein: 0, carbs: 0, fat: 100 },
  },
  "chicken breast": {
    fdcId: 171477,
    description: "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
    per100g: { calories: 165, protein: 31.02, carbs: 0, fat: 3.57 },
  },
  "broccoli florets": {
    fdcId: 170379,
    description: "Broccoli, raw",
    per100g: { calories: 33, protein: 2.6, carbs: 6.32, fat: 0.34 },
  },
  "red bell pepper": {
    fdcId: 2258590,
    description: "Peppers, bell, red, raw",
    per100g: { calories: 31, protein: 0.9, carbs: 6.65, fat: 0.13 },
  },
  "soy sauce": {
    fdcId: 174277,
    description: "Soy sauce made from soy and wheat (shoyu)",
    per100g: { calories: 53, protein: 8.14, carbs: 4.93, fat: 0.57 },
  },
  "garlic": {
    fdcId: 1104647,
    description: "Garlic, raw",
    per100g: { calories: 144, protein: 6.56, carbs: 29.28, fat: 0.41 },
  },
  "ginger": {
    fdcId: 169231,
    description: "Ginger root, raw",
    per100g: { calories: 80, protein: 1.82, carbs: 17.77, fat: 0.75 },
  },
  "large eggs": {
    fdcId: 171287,
    description: "Egg, whole, raw, fresh",
    per100g: { calories: 143, protein: 12.56, carbs: 0.72, fat: 9.51 },
  },
  "diced onion": {
    fdcId: 170000,
    description: "Onions, raw",
    per100g: { calories: 39, protein: 0.98, carbs: 8.9, fat: 0.09 },
  },
  "diced tomato": {
    fdcId: 170457,
    description: "Tomatoes, red, ripe, raw, year round average",
    per100g: { calories: 18, protein: 0.88, carbs: 3.89, fat: 0.2 },
  },
  "spinach leaves": {
    fdcId: 168462,
    description: "Spinach, raw",
    per100g: { calories: 25, protein: 2.86, carbs: 3.02, fat: 0.51 },
  },
  "small corn tortillas": {
    fdcId: 175036,
    description: "Tortillas, ready-to-bake or -fry, corn",
    per100g: { calories: 218, protein: 5.7, carbs: 44.64, fat: 2.85 },
  },
  "rolled oats": {
    fdcId: 173904,
    description: "Cereals, oats, regular and quick, not fortified, dry",
    per100g: { calories: 379, protein: 13.15, carbs: 67.7, fat: 6.52 },
  },
  "almond milk": {
    fdcId: 174832,
    description: "Beverages, almond milk, unsweetened, shelf stable",
    per100g: { calories: 15, protein: 0.4, carbs: 1.31, fat: 0.96 },
  },
  "chia seeds": {
    fdcId: 2343065,
    description: "Chia seeds",
    per100g: { calories: 486, protein: 16.54, carbs: 42.12, fat: 30.74 },
  },
  "honey": {
    fdcId: 169640,
    description: "Honey",
    per100g: { calories: 304, protein: 0.3, carbs: 82.4, fat: 0 },
  },
  "blueberries": {
    fdcId: 171711,
    description: "Blueberries, raw",
    per100g: { calories: 60, protein: 0.72, carbs: 14.53, fat: 0.32 },
  },
};
