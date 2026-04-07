import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecipes } from "../api";
import { RecipeSummary } from "../types";

export default function RecipeList() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes()
      .then(setRecipes)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load recipes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Recipes</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {recipes.map((r) => (
          <li key={r.id} style={{ marginBottom: "0.75rem" }}>
            <Link to={`/recipes/${r.id}`}>{r.title}</Link>
            <span style={{ marginLeft: "0.5rem", color: "#666" }}>serves {r.yield}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
