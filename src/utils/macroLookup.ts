// Broad pre-extracted USDA FDC lookup table for best-guess ingredient matching.
// All values are per 100g.
// Includes macroMap entries (so word-overlap can find them via variant phrases)
// plus ~40 additional common foods.

export type LookupEntry = {
  fdcId: number;
  description: string;
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

export const macroLookup: LookupEntry[] = [
  // ── Already in macroMap (included here so word-overlap finds variants) ──
  { fdcId: 2345743, description: "Olive oil",                                                            per100g: { calories: 900,   protein: 0,     carbs: 0,     fat: 100    } },
  { fdcId: 171477,  description: "Chicken, broilers or fryers, breast, meat only, cooked, roasted",     per100g: { calories: 165,   protein: 31.02, carbs: 0,     fat: 3.57   } },
  { fdcId: 170379,  description: "Broccoli, raw",                                                       per100g: { calories: 33,    protein: 2.6,   carbs: 6.32,  fat: 0.34   } },
  { fdcId: 2258590, description: "Peppers, bell, red, raw",                                             per100g: { calories: 31,    protein: 0.9,   carbs: 6.65,  fat: 0.13   } },
  { fdcId: 174277,  description: "Soy sauce made from soy and wheat (shoyu)",                           per100g: { calories: 53,    protein: 8.14,  carbs: 4.93,  fat: 0.57   } },
  { fdcId: 1104647, description: "Garlic, raw",                                                         per100g: { calories: 144,   protein: 6.56,  carbs: 29.28, fat: 0.41   } },
  { fdcId: 169231,  description: "Ginger root, raw",                                                    per100g: { calories: 80,    protein: 1.82,  carbs: 17.77, fat: 0.75   } },
  { fdcId: 171287,  description: "Egg, whole, raw, fresh",                                              per100g: { calories: 143,   protein: 12.56, carbs: 0.72,  fat: 9.51   } },
  { fdcId: 170000,  description: "Onions, raw",                                                         per100g: { calories: 39,    protein: 0.98,  carbs: 8.9,   fat: 0.09   } },
  { fdcId: 170457,  description: "Tomatoes, red, ripe, raw, year round average",                        per100g: { calories: 18,    protein: 0.88,  carbs: 3.89,  fat: 0.2    } },
  { fdcId: 168462,  description: "Spinach, raw",                                                        per100g: { calories: 25,    protein: 2.86,  carbs: 3.02,  fat: 0.51   } },
  { fdcId: 175036,  description: "Tortillas, ready-to-bake or -fry, corn",                             per100g: { calories: 218,   protein: 5.7,   carbs: 44.64, fat: 2.85   } },
  { fdcId: 173904,  description: "Cereals, oats, regular and quick, not fortified, dry",                per100g: { calories: 379,   protein: 13.15, carbs: 67.7,  fat: 6.52   } },
  { fdcId: 174832,  description: "Beverages, almond milk, unsweetened, shelf stable",                   per100g: { calories: 15,    protein: 0.4,   carbs: 1.31,  fat: 0.96   } },
  { fdcId: 2343065, description: "Chia seeds",                                                          per100g: { calories: 486,   protein: 16.54, carbs: 42.12, fat: 30.74  } },
  { fdcId: 169640,  description: "Honey",                                                               per100g: { calories: 304,   protein: 0.3,   carbs: 82.4,  fat: 0      } },
  { fdcId: 171711,  description: "Blueberries, raw",                                                    per100g: { calories: 60,    protein: 0.72,  carbs: 14.53, fat: 0.32   } },

  // ── Additional common foods ──

  // Meat & fish
  { fdcId: 171790,  description: "Beef, ground, 95% lean meat, raw",                                   per100g: { calories: 137,   protein: 21.41, carbs: 0,     fat: 5.0    } },
  { fdcId: 168652,  description: "Beef, ground, 70% lean meat 30% fat, raw",                           per100g: { calories: 332,   protein: 14.35, carbs: 0,     fat: 30.0   } },
  { fdcId: 167639,  description: "Fish, salmon, coho, raw",                                             per100g: { calories: 140,   protein: 22.56, carbs: 0,     fat: 5.57   } },
  { fdcId: 172006,  description: "Fish, tuna, yellowfin, fresh, cooked",                               per100g: { calories: 130,   protein: 29.15, carbs: 0,     fat: 0.59   } },
  { fdcId: 175179,  description: "Crustaceans, shrimp, raw",                                           per100g: { calories: 85,    protein: 20.1,  carbs: 0,     fat: 0.51   } },
  { fdcId: 171098,  description: "Turkey, breast, meat only, raw",                                     per100g: { calories: 114,   protein: 23.66, carbs: 0.14,  fat: 1.48   } },
  { fdcId: 167818,  description: "Pork, fresh, loin, separable lean and fat, raw",                     per100g: { calories: 198,   protein: 19.74, carbs: 0,     fat: 12.58  } },

  // Dairy
  { fdcId: 173410,  description: "Butter, salted",                                                     per100g: { calories: 717,   protein: 0.85,  carbs: 0.06,  fat: 81.11  } },
  { fdcId: 172217,  description: "Milk, whole, 3.25% milkfat",                                        per100g: { calories: 61,    protein: 3.15,  carbs: 4.78,  fat: 3.27   } },
  { fdcId: 170899,  description: "Cheese, cheddar",                                                    per100g: { calories: 410,   protein: 24.25, carbs: 2.13,  fat: 33.82  } },
  { fdcId: 171284,  description: "Yogurt, plain, whole milk",                                          per100g: { calories: 69,    protein: 3.65,  carbs: 5.12,  fat: 3.87   } },
  { fdcId: 2341163, description: "Cream cheese, regular, plain",                                       per100g: { calories: 350,   protein: 6.15,  carbs: 5.52,  fat: 34.44  } },
  { fdcId: 2340999, description: "Cream, heavy whipping",                                              per100g: { calories: 342,   protein: 2.43,  carbs: 3.32,  fat: 35.82  } },

  // Grains & starches
  { fdcId: 168877,  description: "Rice, white, long-grain, raw, enriched",                             per100g: { calories: 365,   protein: 7.13,  carbs: 79.95, fat: 0.66   } },
  { fdcId: 168927,  description: "Pasta, dry, unenriched",                                             per100g: { calories: 371,   protein: 13.04, carbs: 74.67, fat: 1.51   } },
  { fdcId: 172688,  description: "Bread, whole-wheat, commercially prepared",                          per100g: { calories: 253,   protein: 12.38, carbs: 42.91, fat: 3.53   } },
  { fdcId: 168874,  description: "Quinoa, uncooked",                                                   per100g: { calories: 368,   protein: 14.12, carbs: 64.16, fat: 6.07   } },
  { fdcId: 789890,  description: "Flour, wheat, all-purpose, enriched",                                per100g: { calories: 366,   protein: 10.9,  carbs: 77.3,  fat: 1.48   } },
  { fdcId: 2345818, description: "Sugar, white, granulated",                                           per100g: { calories: 401,   protein: 0,     carbs: 99.6,  fat: 0.32   } },

  // Vegetables
  { fdcId: 170393,  description: "Carrots, raw",                                                       per100g: { calories: 41,    protein: 0.93,  carbs: 9.58,  fat: 0.24   } },
  { fdcId: 170026,  description: "Potatoes, flesh and skin, raw",                                      per100g: { calories: 77,    protein: 2.05,  carbs: 17.49, fat: 0.09   } },
  { fdcId: 168482,  description: "Sweet potato, raw",                                                  per100g: { calories: 86,    protein: 1.57,  carbs: 20.12, fat: 0.05   } },
  { fdcId: 169251,  description: "Mushrooms, white, raw",                                              per100g: { calories: 22,    protein: 3.09,  carbs: 3.26,  fat: 0.34   } },
  { fdcId: 171705,  description: "Avocados, raw",                                                      per100g: { calories: 160,   protein: 2.0,   carbs: 8.53,  fat: 14.66  } },
  { fdcId: 168421,  description: "Kale, raw",                                                          per100g: { calories: 37,    protein: 2.92,  carbs: 4.42,  fat: 1.49   } },
  { fdcId: 168409,  description: "Cucumber, with peel, raw",                                           per100g: { calories: 15,    protein: 0.64,  carbs: 3.29,  fat: 0.14   } },
  { fdcId: 169291,  description: "Squash, zucchini, includes skin, raw",                               per100g: { calories: 17,    protein: 1.21,  carbs: 3.11,  fat: 0.32   } },

  // Fruit
  { fdcId: 1105314, description: "Bananas, ripe, raw",                                                 per100g: { calories: 97,    protein: 0.74,  carbs: 23.0,  fat: 0.29   } },
  { fdcId: 1105430, description: "Apples, with skin, raw",                                             per100g: { calories: 62,    protein: 0.19,  carbs: 14.79, fat: 0.21   } },
  { fdcId: 167762,  description: "Strawberries, raw",                                                  per100g: { calories: 34,    protein: 0.64,  carbs: 7.71,  fat: 0.22   } },
  { fdcId: 167747,  description: "Lemon juice, raw",                                                   per100g: { calories: 22,    protein: 0.35,  carbs: 6.9,   fat: 0.24   } },

  // Legumes
  { fdcId: 172421,  description: "Lentils, cooked, boiled",                                            per100g: { calories: 116,   protein: 9.02,  carbs: 20.13, fat: 0.38   } },
  { fdcId: 173757,  description: "Chickpeas, cooked, boiled",                                          per100g: { calories: 164,   protein: 8.86,  carbs: 27.42, fat: 2.59   } },
  { fdcId: 173735,  description: "Beans, black, cooked, boiled",                                       per100g: { calories: 132,   protein: 8.86,  carbs: 23.71, fat: 0.54   } },
  { fdcId: 172448,  description: "Tofu, firm",                                                         per100g: { calories: 78,    protein: 9.04,  carbs: 2.85,  fat: 4.17   } },

  // Nuts, seeds & oils
  { fdcId: 170567,  description: "Nuts, almonds",                                                      per100g: { calories: 579,   protein: 21.15, carbs: 21.55, fat: 49.93  } },
  { fdcId: 170187,  description: "Nuts, walnuts, english",                                             per100g: { calories: 654,   protein: 15.23, carbs: 13.71, fat: 65.21  } },
  { fdcId: 172469,  description: "Peanut butter, chunk style, without salt",                           per100g: { calories: 589,   protein: 24.06, carbs: 21.57, fat: 49.94  } },
  { fdcId: 2345739, description: "Coconut oil",                                                        per100g: { calories: 895,   protein: 0,     carbs: 0.84,  fat: 99.1   } },

  // Dairy alternatives
  { fdcId: 2257046, description: "Oat milk, unsweetened, plain",                                       per100g: { calories: 48,    protein: 0.8,   carbs: 5.1,   fat: 2.75   } },
];
