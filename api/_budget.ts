import { getDb } from "./_db.js";

export const BUDGET_LIMIT = 10; // USD

export interface BudgetStore {
  getSpent(): Promise<number>;
  // Atomically adds amount and returns the new cumulative total.
  addSpent(amount: number): Promise<number>;
}

// ── Supabase-backed store (primary) ───────────────────────────────────────────

export const dbBudget: BudgetStore = {
  async getSpent() {
    const { data, error } = await getDb()
      .from("ai_budget")
      .select("total_spent_usd")
      .eq("id", 1)
      .single();
    if (error || !data) return 0;
    return Number(data.total_spent_usd);
  },

  async addSpent(amount: number) {
    const { data, error } = await getDb().rpc("add_budget_spent", {
      amount_usd: amount,
    });
    if (error || data == null) {
      // RPC failed — return a safe estimate so the caller can still respond
      return amount;
    }
    return Number(data);
  },
};

// ── In-memory fallback (used if DB is not configured) ─────────────────────────

let memSpent = 0;

export const memoryBudget: BudgetStore = {
  async getSpent() {
    return memSpent;
  },
  async addSpent(amount: number) {
    memSpent += amount;
    return memSpent;
  },
};

// ── Active store ──────────────────────────────────────────────────────────────
// Switches to DB automatically when Supabase env vars are present.

export function getBudgetStore(): BudgetStore {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return dbBudget;
  }
  return memoryBudget;
}
