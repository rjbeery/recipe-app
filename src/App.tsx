import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, Link, useLocation } from "react-router-dom";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";
import BudgetDisplay from "./components/BudgetDisplay";

export type AppShellContext = {
  refreshBudget: () => void;
};

function AppShell() {
  const location = useLocation();
  const isDetail = location.pathname.startsWith("/recipes/");
  // null = not yet fetched or fetch failed (shown as "–" in display)
  const [budgetSpent, setBudgetSpent] = useState<number | null>(null);
  const budgetLimit = 10;

  function refreshBudget() {
    fetch("/api/budget")
      .then((r) => r.json())
      .then((d) => setBudgetSpent(d.spent))
      .catch(() => {}); // keep current value; display handles null gracefully
  }

  // Fetch on mount so the header reflects prior spend from the start
  useEffect(() => { refreshBudget(); }, []);

  return (
    <>
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 0",
        borderBottom: "1px solid #e5e7eb",
        marginBottom: "1.25rem",
        gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Recipe Macros</span>
          {isDetail && (
            <Link to="/" style={{ fontSize: "0.82rem", color: "#6b7280" }}>
              ← Recipes
            </Link>
          )}
        </div>
        <BudgetDisplay spent={budgetSpent} limit={budgetLimit} />
      </header>
      <Outlet context={{ refreshBudget } satisfies AppShellContext} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<RecipeList />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
