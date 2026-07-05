/** Tarifs OpenAI indicatifs (USD / 1M tokens). */
const MODEL_PRICING_USD: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1": { input: 2, output: 8 },
};

const DEFAULT_PRICING = MODEL_PRICING_USD["gpt-4o-mini"];
const USD_TO_EUR = Number(process.env.AI_USD_TO_EUR ?? "0.92");

function resolvePricing(model: string) {
  const normalized = model.toLowerCase();
  if (MODEL_PRICING_USD[normalized]) return MODEL_PRICING_USD[normalized];

  const prefix = Object.keys(MODEL_PRICING_USD).find((key) => normalized.startsWith(key));
  if (prefix) return MODEL_PRICING_USD[prefix];

  return DEFAULT_PRICING;
}

export function calculateAiCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = resolvePricing(model);
  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

export function calculateAiCostEur(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  return calculateAiCostUsd(model, promptTokens, completionTokens) * USD_TO_EUR;
}
