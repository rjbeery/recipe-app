import { useParams, Link } from "react-router-dom";
import { getRecipeById } from "../recipes";
import { calculateMacros } from "../utils/calculateMacros";

const row: React.CSSProperties = {
  display: "flex", gap: "2rem", margin: "0.25rem 0", fontSize: "0.9rem",
};
const label: React.CSSProperties = { width: 100, color: "#555" };

function r(n: number) { return Math.round(n); }

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe = getRecipeById(id!);

  if (!recipe) return <p>Recipe not found.</p>;

  const { total, perServing, unmatched } = calculateMacros(recipe);

  return (
    <div>
      <Link to="/">← Back</Link>
      <h1 style={{ marginTop: "1rem" }}>{recipe.title}</h1>
      <img
        src={recipe.image}
        alt={recipe.title}
        style={{ width: "100%", maxWidth: 320, borderRadius: 8, display: "block", margin: "1rem 0" }}
      />
      <p>Serves: {recipe.yield}</p>

      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>{ing.rawText}</li>
        ))}
      </ul>

      <h2>Nutrition (estimated)</h2>
      <div style={{ marginBottom: "0.25rem", fontSize: "0.8rem", color: "#888" }}>
        per serving / total recipe
      </div>
      <div style={row}><span style={label}>Calories</span>  <span>{r(perServing.calories)} / {r(total.calories)} kcal</span></div>
      <div style={row}><span style={label}>Protein</span>   <span>{r(perServing.protein)} / {r(total.protein)} g</span></div>
      <div style={row}><span style={label}>Carbs</span>     <span>{r(perServing.carbs)} / {r(total.carbs)} g</span></div>
      <div style={row}><span style={label}>Fat</span>       <span>{r(perServing.fat)} / {r(total.fat)} g</span></div>

      {unmatched.length > 0 && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#888" }}>
          Not included: {unmatched.join(", ")}
        </p>
      )}
    </div>
  );
}
