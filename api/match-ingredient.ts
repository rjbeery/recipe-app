import { getBudgetStore, BUDGET_LIMIT } from "./_budget.js";
import { getDb } from "./_db.js";

type Candidate = { fdcId: number; description: string; score: number };

type RequestBody = {
  phrase: string;
  grams: number;
  candidates: Candidate[];
  recipeId?: string; // optional — used for AI usage logging
};

type AiChoice = {
  fdcId: number;
  confidence: "high" | "medium" | "low";
  reason: string;
};

// claude-haiku-4-5 pricing (per million tokens)
const INPUT_COST_PER_M = 0.8;
const OUTPUT_COST_PER_M = 4.0;

function estimateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * INPUT_COST_PER_M + outputTokens * OUTPUT_COST_PER_M) / 1_000_000;
}

async function logUsage(params: {
  recipeId: string | undefined;
  phrase: string;
  matchedFdcId: number | null;
  confidence: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}): Promise<void> {
  try {
    await getDb().from("ai_usage_log").insert({
      recipe_id: params.recipeId ?? null,
      ingredient_raw_text: null, // phrase is available; raw not sent to server
      phrase: params.phrase,
      matched_fdc_id: params.matchedFdcId,
      confidence: params.confidence,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      cost_usd: params.costUsd,
    });
  } catch {
    // Logging failure should never surface to the user
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { phrase, grams, candidates, recipeId } = req.body as RequestBody;
  if (!phrase || !Array.isArray(candidates)) {
    return res.status(400).json({ error: "Missing phrase or candidates" });
  }

  const budget = getBudgetStore();

  // Check budget before calling AI
  const spent = await budget.getSpent();
  if (spent >= BUDGET_LIMIT) {
    return res.status(200).json({
      matchedFdcId: null,
      matchedDescription: null,
      confidence: "unmatched",
      reason: "Demo budget exhausted.",
      estimatedCost: 0,
      budgetUsed: spent,
      budgetLimit: BUDGET_LIMIT,
      budgetExhausted: true,
    });
  }

  // No candidates → skip AI entirely; nothing to choose from
  if (candidates.length === 0) {
    return res.status(200).json({
      matchedFdcId: null,
      matchedDescription: null,
      confidence: "unmatched",
      reason: "No candidates found in local database.",
      estimatedCost: 0,
      budgetUsed: spent,
      budgetLimit: BUDGET_LIMIT,
      budgetExhausted: false,
    });
  }

  const candidateList = candidates
    .map((c, i) => `${i + 1}. fdcId=${c.fdcId} "${c.description}"`)
    .join("\n");

  const userMessage = `Ingredient: "${phrase}" (${grams}g)\nUSDA candidates (choose exactly one):\n${candidateList}`;

  const system = [
    "You are a nutrition database assistant.",
    "You will be given an ingredient phrase and a numbered list of USDA food candidates.",
    "You MUST select exactly one candidate from the list.",
    "You MUST NOT invent or suggest any food not in the list.",
    "Respond with ONLY valid JSON — no markdown, no text outside the JSON object:",
    `{"fdcId": <number>, "confidence": <"high"|"medium"|"low">, "reason": "<one sentence>"}`,
  ].join(" ");

  let aiResponse: Response;
  try {
    aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch {
    return res.status(502).json({ error: "Failed to reach Anthropic API" });
  }

  if (!aiResponse.ok) {
    const text = await aiResponse.text();
    return res.status(502).json({ error: `Anthropic API error: ${text}` });
  }

  const aiData = await aiResponse.json();
  const content: string = aiData.content?.[0]?.text ?? "";
  const usage = aiData.usage ?? {};
  const inputTokens = usage.input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  const cost = estimateCost(inputTokens, outputTokens);

  // Atomically update budget (returns new total)
  const newSpent = await budget.addSpent(cost);

  const validIds = new Set(candidates.map((c) => c.fdcId));
  const best = candidates[0]; // highest-score heuristic fallback

  let choice: AiChoice;
  try {
    const parsed = JSON.parse(content);
    if (!validIds.has(parsed.fdcId)) throw new Error("fdcId not in candidate list");
    choice = parsed as AiChoice;
  } catch {
    // Fallback: top heuristic candidate at low confidence
    choice = {
      fdcId: best.fdcId,
      confidence: "low",
      reason: "AI response invalid; fell back to top heuristic match.",
    };
  }

  // Look up description from candidates — never trust AI-supplied text
  const matchedCandidate = candidates.find((c) => c.fdcId === choice.fdcId)!;

  // Log the AI call (fire-and-forget — don't block the response)
  logUsage({
    recipeId,
    phrase,
    matchedFdcId: choice.fdcId,
    confidence: choice.confidence,
    inputTokens,
    outputTokens,
    costUsd: cost,
  });

  return res.status(200).json({
    matchedFdcId: choice.fdcId,
    matchedDescription: matchedCandidate.description,
    confidence: choice.confidence,
    reason: choice.reason,
    estimatedCost: cost,
    budgetUsed: newSpent,
    budgetLimit: BUDGET_LIMIT,
    budgetExhausted: false,
  });
}
