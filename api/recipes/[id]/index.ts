// GET    /api/recipes/:id — returns recipe metadata
// DELETE /api/recipes/:id — removes the recipe and cascades to its ingredient rows
import { getDb } from "../../_db.js";

export default async function handler(req: any, res: any) {
  const recipeId: string = req.query.id;

  if (req.method === "GET") {
    const { data, error } = await getDb()
      .from("recipes")
      .select("id, title, yield_servings, image_path")
      .eq("id", recipeId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    return res.status(200).json({
      id: data.id,
      title: data.title,
      yield: data.yield_servings,
      image: data.image_path ?? "",
    });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { error } = await getDb().from("recipes").delete().eq("id", recipeId);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ deleted: recipeId });
}
