export type ParsedIngredient = {
  grams: number;
  phrase: string; // lowercase, trimmed — used as key into macroMap
};

// Parses "200g chicken breast" → { grams: 200, phrase: "chicken breast" }
// Returns null if the string does not match the expected "Xg <name>" format
export function parseIngredient(raw: string): ParsedIngredient | null {
  const match = raw.match(/^([\d.]+)g\s+(.+)$/i);
  if (!match) return null;
  return {
    grams: parseFloat(match[1]),
    phrase: match[2].toLowerCase().trim(),
  };
}
