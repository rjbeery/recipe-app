// GET /api/budget — returns current AI spend and limit
import { getBudgetStore, BUDGET_LIMIT } from "./_budget.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const spent = await getBudgetStore().getSpent();
  return res.status(200).json({ spent, limit: BUDGET_LIMIT });
}
