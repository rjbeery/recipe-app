import { Router, Request, Response } from "express";
import { getAllRecipes, getRecipeById } from "./store";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json(getAllRecipes());
});

router.get("/:id", (req: Request, res: Response) => {
  const recipe = getRecipeById(req.params.id);
  if (!recipe) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  res.json(recipe);
});

export default router;
