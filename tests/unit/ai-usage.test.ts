import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateAiCostEur, calculateAiCostUsd } from "@/lib/ai/pricing";
import { formatAiCostEur, formatTokenCount } from "@/lib/ai/format-ai-usage";
import { summarizeAiUsageEntries, createAiUsageEntry } from "@/services/ai/ai-usage.service";

test("calculateAiCostUsd for gpt-4o-mini", () => {
  const cost = calculateAiCostUsd("gpt-4o-mini", 1_000_000, 500_000);
  assert.equal(cost, 0.15 + 0.3);
});

test("calculateAiCostEur applies conversion", () => {
  const cost = calculateAiCostEur("gpt-4o-mini", 10_000, 5_000);
  assert.ok(cost > 0);
});

test("formatTokenCount abbreviates large values", () => {
  assert.match(formatTokenCount(128_450), /128,4 k|128,5 k/);
  assert.equal(formatTokenCount(850), "850");
});

test("formatAiCostEur displays currency", () => {
  assert.match(formatAiCostEur(0.0382), /€/);
});

test("summarizeAiUsageEntries aggregates totals", () => {
  const summary = summarizeAiUsageEntries([
    createAiUsageEntry("adaptation", "gpt-4o-mini", 1000, 500),
    createAiUsageEntry("falc", "gpt-4o-mini", 2000, 800),
  ]);

  assert.equal(summary.totalTokens, 4300);
  assert.equal(summary.requestCount, 2);
  assert.ok(summary.estimatedCostEur > 0);
});
