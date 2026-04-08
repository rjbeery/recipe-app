export type ParsedIngredient = {
  rawText: string;
  quantity: number;
  unit: string;
  grams: number | null; // null when unit has no reliable gram conversion
  phrase: string;       // lowercase ingredient name
};

// Approximate gram equivalents for common units
const UNIT_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  ml: 1,
  l: 1000,
  oz: 28.35,
  lb: 453.6,
  tbsp: 15,
  tsp: 5,
  cup: 240,
};

// Matches: "200g phrase", "1.5 tbsp phrase", "2 cups phrase"
const PATTERN = /^([\d.]+)\s*(g|kg|mg|ml|l|oz|lb|tbsps?|tsps?|cups?)\s+(.+)$/i;

export function parseIngredient(raw: string): ParsedIngredient | null {
  const match = raw.trim().match(PATTERN);
  if (!match) return null;

  const quantity = parseFloat(match[1]);
  const unit = match[2].toLowerCase().replace(/s$/, ""); // normalize plurals
  const phrase = match[3].toLowerCase().trim();
  const gramsPerUnit = UNIT_GRAMS[unit];
  const grams = gramsPerUnit != null ? quantity * gramsPerUnit : null;

  return { rawText: raw, quantity, unit, grams, phrase };
}
