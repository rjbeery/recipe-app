import { useState } from "react";
import { Link } from "react-router-dom";
import { matchLines, IngredientMatch, Confidence } from "../utils/matchIngredient";
import { MacroTotals } from "../utils/calculateMacros";
import { aiMatchAll, AiMatchResult } from "../utils/aiMatch";
import BudgetDisplay from "../components/BudgetDisplay";

const PLACEHOLDER = `200g chicken breast
150g brown rice
100g broccoli
15g olive oil
30g cheddar`;

const CONFIDENCE_COLOR: Record<Confidence, string> = {
  high:      "#166534",
  medium:    "#92400e",
  low:       "#991b1b",
  unmatched: "#6b7280",
};

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high:      "high",
  medium:    "medium (best-guess)",
  low:       "low (weak match)",
  unmatched: "unmatched",
};

function addTotals(matches: IngredientMatch[]): MacroTotals {
  return matches.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.macros?.calories ?? 0),
      protein:  acc.protein  + (m.macros?.protein  ?? 0),
      carbs:    acc.carbs    + (m.macros?.carbs     ?? 0),
      fat:      acc.fat      + (m.macros?.fat       ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function r(n: number) { return Math.round(n); }

export default function Estimate() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<IngredientMatch[] | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, AiMatchResult>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(10);
  const [showBudget, setShowBudget] = useState(false);

  function handleEstimate() {
    setResults(matchLines(text));
    setAiResults({});
  }

  async function handleImproveWithAI() {
    if (!results) return;
    setAiLoading(true);
    try {
      const raws = results.map((m) => m.raw);
      const matched = await aiMatchAll(raws);
      const byRaw: Record<string, AiMatchResult> = {};
      for (const m of matched) {
        byRaw[m.raw] = m;
        // Update budget display from the last response received
        setBudgetUsed(m.budgetUsed);
        setBudgetLimit(m.budgetLimit);
        setShowBudget(true);
      }
      setAiResults(byRaw);
    } finally {
      setAiLoading(false);
    }
  }

  const totals = results ? addTotals(results.filter((m) => m.confidence !== "unmatched")) : null;
  const unmatched = results?.filter((m) => m.confidence === "unmatched") ?? [];
  const lowConfidence = results?.filter((m) => m.confidence === "low") ?? [];

  return (
    <div>
      <Link to="/">← Back</Link>
      <h1 style={{ marginTop: "1rem" }}>Macro Estimator</h1>
      <p style={{ color: "#555", fontSize: "0.9rem" }}>
        Paste ingredient lines in the format <code>200g chicken breast</code>, one per line.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={8}
        style={{ width: "100%", fontFamily: "monospace", fontSize: "0.9rem", padding: "0.5rem", boxSizing: "border-box", marginBottom: "0.75rem" }}
      />
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button onClick={handleEstimate} style={{ padding: "0.4rem 1.2rem", cursor: "pointer" }}>
          Estimate
        </button>
        {results && (
          <button
            onClick={handleImproveWithAI}
            disabled={aiLoading}
            style={{ padding: "0.4rem 1.2rem", cursor: aiLoading ? "default" : "pointer", opacity: aiLoading ? 0.6 : 1 }}
          >
            {aiLoading ? "Improving…" : "Improve with AI"}
          </button>
        )}
      </div>

      {results && (
        <div style={{ marginTop: "1.5rem" }}>

          {/* Per-ingredient breakdown */}
          <h2>Breakdown</h2>
          {results.map((m, i) => {
            const ai = aiResults[m.raw];
            return (
              <div key={i} style={{ borderTop: "1px solid #e5e7eb", padding: "0.5rem 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <code style={{ fontSize: "0.85rem" }}>{m.raw}</code>
                  <span style={{ fontSize: "0.75rem", color: CONFIDENCE_COLOR[m.confidence] }}>
                    {CONFIDENCE_LABEL[m.confidence]}
                  </span>
                </div>
                {m.matchedDescription && (
                  <div style={{ fontSize: "0.78rem", color: "#666", marginTop: "0.15rem" }}>
                    → {m.matchedDescription}
                  </div>
                )}
                {m.macros && (
                  <div style={{ fontSize: "0.82rem", color: "#444", marginTop: "0.15rem" }}>
                    {r(m.macros.calories)} kcal · {r(m.macros.protein)}g protein · {r(m.macros.carbs)}g carbs · {r(m.macros.fat)}g fat
                  </div>
                )}
                {m.confidence === "unmatched" && (
                  <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "0.15rem" }}>
                    {m.grams === null ? "Could not parse — expected format: 200g ingredient name" : `Phrase not matched: "${m.phrase}"`}
                  </div>
                )}

                {/* AI improvement row */}
                {ai && (
                  <div style={{ marginTop: "0.35rem", paddingLeft: "0.75rem", borderLeft: "2px solid #6366f1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 600 }}>AI</span>
                      <span style={{ fontSize: "0.75rem", color: CONFIDENCE_COLOR[ai.confidence] }}>
                        {CONFIDENCE_LABEL[ai.confidence]}
                      </span>
                    </div>
                    {ai.matchedDescription && (
                      <div style={{ fontSize: "0.78rem", color: "#555", marginTop: "0.1rem" }}>
                        → {ai.matchedDescription}
                      </div>
                    )}
                    {ai.reason && (
                      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.1rem", fontStyle: "italic" }}>
                        {ai.reason}
                      </div>
                    )}
                    {ai.budgetExhausted && (
                      <div style={{ fontSize: "0.75rem", color: "#991b1b", marginTop: "0.1rem" }}>
                        Demo budget exhausted.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Totals */}
          {totals && (
            <>
              <h2 style={{ marginTop: "1.5rem" }}>Totals (matched only)</h2>
              <div style={{ display: "flex", gap: "2rem", fontSize: "0.9rem" }}>
                <span><strong>{r(totals.calories)}</strong> kcal</span>
                <span><strong>{r(totals.protein)}g</strong> protein</span>
                <span><strong>{r(totals.carbs)}g</strong> carbs</span>
                <span><strong>{r(totals.fat)}g</strong> fat</span>
              </div>
            </>
          )}

          {/* Warnings */}
          {unmatched.length > 0 && (
            <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "#6b7280" }}>
              <strong>Not included ({unmatched.length}):</strong>{" "}
              {unmatched.map((m) => m.raw).join(", ")}
            </p>
          )}
          {lowConfidence.length > 0 && (
            <p style={{ fontSize: "0.82rem", color: "#991b1b" }}>
              <strong>Low-confidence matches — verify:</strong>{" "}
              {lowConfidence.map((m) => m.raw).join(", ")}
            </p>
          )}
        </div>
      )}

      {showBudget && <BudgetDisplay spent={budgetUsed} limit={budgetLimit} />}
    </div>
  );
}
