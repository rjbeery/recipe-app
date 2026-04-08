import { memoryBudget, BUDGET_LIMIT } from "./_budget";

type Candidate = { fdcId: number; description: string; score: number };

type RequestBody = {
  phrase: string;
  grams: number;
  candidates: Candidate[];
};

type AiChoice = {
  fdcId: number | null;
  description: string | null;
  confidence: "high" | "medium" | "low" | "unmatched";
  reason: string;
};

// claude-haiku-4-5 pricing (per million tokens)
const INPUT_COST_PER_M = 0.8;
const OUTPUT_COST_PER_M = 4.0;

function estimateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * INPUT_COST_PER_M + outputTokens * OUTPUT_COST_PER_M) / 1_000_000;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { phrase, grams, candidates } = req.body as RequestBody;
  if (!phrase || !Array.isArray(candidates)) {
    return res.status(400).json({ error: "Missing phrase or candidates" });
  }

  // Check budget before calling AI
  const spent = await memoryBudget.getSpent();
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

  const candidateList = candidates
    .map((c, i) => `${i + 1}. fdcId=${c.fdcId} "${c.description}" (score=${c.score.toFixed(2)})`)
    .join("\n");

  const userMessage =
    candidates.length === 0
      ? `Ingredient: "${phrase}" (${grams}g)\nNo local candidates found. Return null for fdcId.`
      : `Ingredient: "${phrase}" (${grams}g)\nLocal USDA candidates:\n${candidateList}`;

  const system = [
    "You are a nutrition database assistant.",
    "Given an ingredient phrase and optional USDA food database candidates, select the single best match.",
    "Only choose from the provided candidate list. If none fit, use null.",
    "Respond with ONLY valid JSON — no markdown, no text outside the JSON object:",
    `{"fdcId": <number|null>, "description": <string|null>, "confidence": <"high"|"medium"|"low"|"unmatched">, "reason": "<one sentence>"}`,
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
  const cost = estimateCost(usage.input_tokens ?? 0, usage.output_tokens ?? 0);

  await memoryBudget.addSpent(cost);
  const newSpent = await memoryBudget.getSpent();

  let choice: AiChoice;
  try {
    choice = JSON.parse(content);
  } catch {
    choice = {
      fdcId: null,
      description: null,
      confidence: "unmatched",
      reason: "AI returned unparseable response.",
    };
  }

  // Safety: reject any fdcId not in the candidate list (hallucination guard)
  const validIds = new Set(candidates.map((c) => c.fdcId));
  if (choice.fdcId !== null && !validIds.has(choice.fdcId)) {
    choice.fdcId = null;
    choice.description = null;
    choice.confidence = "unmatched";
    choice.reason += " (fdcId not in candidate list — rejected)";
  }

  return res.status(200).json({
    matchedFdcId: choice.fdcId,
    matchedDescription: choice.description,
    confidence: choice.confidence,
    reason: choice.reason,
    estimatedCost: cost,
    budgetUsed: newSpent,
    budgetLimit: BUDGET_LIMIT,
    budgetExhausted: false,
  });
}
