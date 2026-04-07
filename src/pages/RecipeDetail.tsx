import { useParams, Link } from "react-router-dom";
import { getRecipeById } from "../recipes";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe = getRecipeById(id!);

  if (!recipe) return <p>Recipe not found.</p>;

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
          <li key={i}>{ing}</li>
        ))}
      </ul>
    </div>
  );
}
