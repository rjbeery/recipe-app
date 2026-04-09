import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllRecipes, addRecipe, removeRecipe } from "../recipes";
import { structureIngredient } from "../utils/structureIngredient";
import { saveIngredients, deleteRecipe, fetchRecipes } from "../utils/recipeApi";

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState(getAllRecipes);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [yieldServings, setYieldServings] = useState(2);
  const [ingredientText, setIngredientText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Hydrate from DB on mount so the list reflects the true persisted state:
  // user-created recipes appear, deleted recipes stay gone.
  useEffect(() => {
    fetchRecipes()
      .then((list) => { if (list && list.length > 0) setRecipes(list); })
      .catch(() => {}); // DB unavailable — local static list is the fallback
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this recipe?")) return;
    setDeleteError(null);
    try {
      await deleteRecipe(id);
    } catch {
      setDeleteError("Could not remove from server. Removed locally only.");
    }
    removeRecipe(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const id = `${slugify(title)}-${Date.now()}`;
    const ingredients = ingredientText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map(structureIngredient);

    const recipe = { id, title, yield: yieldServings, image: "", ingredients };

    // Register in local store immediately so RecipeDetail can resolve it
    addRecipe(recipe);

    // Persist raw ingredient lines to DB so the recipe survives refresh
    setIsSaving(true);
    try {
      await saveIngredients(recipe, ingredients);
    } catch {
      setSaveError("Saved locally only — server sync failed.");
    } finally {
      setIsSaving(false);
    }

    navigate(`/recipes/${id}`);
  }

  return (
    <div>
      <h1>Recipes</h1>
      {deleteError && (
        <p style={{ color: "#991b1b", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>{deleteError}</p>
      )}
      {recipes.length === 0 && !showForm && (
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "0 0 1rem" }}>No recipes yet.</p>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {recipes.map((r) => (
          <li key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <img
              src={r.image || "/images/placeholder.svg"}
              alt={r.title}
              style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <Link to={`/recipes/${r.id}`}>{r.title}</Link>
              <div style={{ color: "#666", fontSize: "0.875rem" }}>serves {r.yield}</div>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              style={{ fontSize: "0.75rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0.2rem 0.4rem" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{ fontSize: "0.85rem", padding: "0.3rem 0.8rem", cursor: "pointer" }}
        >
          + Add recipe
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: "0.5rem", padding: "0.75rem", background: "#f9fafb", borderRadius: 6 }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "0.2rem" }}>Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.3rem 0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "0.2rem" }}>Yield (servings)</label>
            <input
              type="number"
              min={1}
              required
              value={yieldServings}
              onChange={(e) => setYieldServings(Number(e.target.value))}
              style={{ width: 80, padding: "0.3rem 0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "0.2rem" }}>
              Ingredients (one per line, e.g. <code>200g chicken breast</code>)
            </label>
            <textarea
              required
              value={ingredientText}
              onChange={(e) => setIngredientText(e.target.value)}
              rows={5}
              style={{ width: "100%", boxSizing: "border-box", fontFamily: "monospace", fontSize: "0.85rem", padding: "0.3rem 0.5rem" }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button type="submit" disabled={isSaving} style={{ padding: "0.3rem 0.9rem", cursor: isSaving ? "default" : "pointer", opacity: isSaving ? 0.6 : 1 }}>
              {isSaving ? "Saving…" : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} disabled={isSaving} style={{ padding: "0.3rem 0.9rem", cursor: isSaving ? "default" : "pointer" }}>Cancel</button>
          </div>
          {saveError && (
            <p style={{ color: "#92400e", fontSize: "0.78rem", margin: "0.4rem 0 0" }}>{saveError}</p>
          )}
        </form>
      )}
    </div>
  );
}
