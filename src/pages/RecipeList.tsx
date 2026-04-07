import { Link } from "react-router-dom";
import { getAllRecipes } from "../recipes";

export default function RecipeList() {
  const recipes = getAllRecipes();

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
