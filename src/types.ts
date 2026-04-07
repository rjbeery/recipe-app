export type RecipeSummary = {
  id: string;
  title: string;
  yield: number;
  image: string;
};

export type Recipe = {
  id: string;
  title: string;
  yield: number;
  image: string;
  ingredients: string[];
};
