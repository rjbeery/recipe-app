import { Link } from "react-router-dom";
import { getAllRecipes } from "../recipes";

export default function RecipeList() {
  const recipes = getAllRecipes();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>Recipes</h1>
        <Link to="/estimate" style={{ fontSize: "0.875rem" }}>Macro Estimator →</Link>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {recipes.map((r) => (
          <li key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <img
              src={r.image}
              alt={r.title}
              style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
            />
            <div>
              <Link to={`/recipes/${r.id}`}>{r.title}</Link>
              <div style={{ color: "#666", fontSize: "0.875rem" }}>serves {r.yield}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
