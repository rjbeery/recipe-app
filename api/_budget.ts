export const BUDGET_LIMIT = 10; // USD

export interface BudgetStore {
  getSpent(): Promise<number>;
  addSpent(amount: number): Promise<void>;
}

// In-memory implementation — resets on cold start.
// Swap `memoryBudget` for a KV-backed store (e.g. Vercel KV) without changing callers.
let spent = 0;

export const memoryBudget: BudgetStore = {
  async getSpent() {
    return spent;
  },
  async addSpent(amount: number) {
    spent += amount;
  },
};
