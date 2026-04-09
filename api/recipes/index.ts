// GET /api/recipes — returns all recipes persisted in the database
import { getDb } from "../_db.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, error } = await getDb()
    .from("recipes")
    .select("id, title, yield_servings, image_path");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(
    (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      yield: r.yield_servings,
      image: r.image_path ?? "",
    }))
  );
}
