import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRecipe } from "../api";
import { Recipe } from "../types";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipe(id!)
      .then(setRecipe)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load recipe"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!recipe) return null;

  return (
    <div>
      <Link to="/">← Back</Link>
      <h1 style={{ marginTop: "1rem" }}>{recipe.title}</h1>
      <p>Serves: {recipe.yield}</p>
      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>
    </div>
  );
}
