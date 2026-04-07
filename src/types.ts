export type RecipeSummary = {
  id: string;
  title: string;
  yield: number;
};

export type Recipe = {
  id: string;
  title: string;
  yield: number;
  ingredients: string[];
};
