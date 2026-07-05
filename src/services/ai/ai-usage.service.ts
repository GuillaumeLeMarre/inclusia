import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { calculateAiCostEur } from "@/lib/ai/pricing";
import {
  findAiUsageEventsByTeacher,
  recordAiUsageEvent,
} from "@/repositories/analytics.repository";
import type { AiUsageEntry, AiUsageEventData, AiUsageStats } from "@/types/ai-usage";
import type OpenAI from "openai";

type Client = SupabaseClient<Database>;

export function createAiUsageEntry(
  operation: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
): AiUsageEntry {
  const totalTokens = promptTokens + completionTokens;
  return {
    operation,
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    costEur: calculateAiCostEur(model, promptTokens, completionTokens),
  };
}

export function extractAiUsageFromCompletion(
  response: OpenAI.Chat.Completions.ChatCompletion,
  operation: string,
  modelOverride?: string,
): AiUsageEntry | null {
  const usage = response.usage;
  if (!usage) return null;

  const model = modelOverride ?? response.model ?? "gpt-4o-mini";
  return createAiUsageEntry(
    operation,
    model,
    usage.prompt_tokens ?? 0,
    usage.completion_tokens ?? 0,
  );
}

function toEventData(entry: AiUsageEntry): AiUsageEventData {
  return {
    operation: entry.operation,
    model: entry.model,
    prompt_tokens: entry.promptTokens,
    completion_tokens: entry.completionTokens,
    total_tokens: entry.totalTokens,
    cost_eur: entry.costEur,
  };
}

export class AiUsageTracker {
  private entries: AiUsageEntry[] = [];

  add(entry: AiUsageEntry | null | undefined) {
    if (entry) this.entries.push(entry);
  }

  getSnapshot(): AiUsageStats {
    return summarizeAiUsageEntries(this.entries);
  }

  async persist(client: Client, teacherId: string) {
    await Promise.all(
      this.entries.map((entry) =>
        recordAiUsageEvent(client, teacherId, toEventData(entry)),
      ),
    );
  }
}

export function summarizeAiUsageEntries(entries: AiUsageEntry[]): AiUsageStats {
  return entries.reduce<AiUsageStats>(
    (acc, entry) => ({
      totalTokens: acc.totalTokens + entry.totalTokens,
      promptTokens: acc.promptTokens + entry.promptTokens,
      completionTokens: acc.completionTokens + entry.completionTokens,
      estimatedCostEur: acc.estimatedCostEur + entry.costEur,
      requestCount: acc.requestCount + 1,
    }),
    {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedCostEur: 0,
      requestCount: 0,
    },
  );
}

function parseEventData(value: unknown): AiUsageEventData | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (
    typeof data.total_tokens !== "number"
    || typeof data.cost_eur !== "number"
  ) {
    return null;
  }

  return {
    operation: typeof data.operation === "string" ? data.operation : "unknown",
    model: typeof data.model === "string" ? data.model : "unknown",
    prompt_tokens: typeof data.prompt_tokens === "number" ? data.prompt_tokens : 0,
    completion_tokens: typeof data.completion_tokens === "number" ? data.completion_tokens : 0,
    total_tokens: data.total_tokens,
    cost_eur: data.cost_eur,
  };
}

export async function getTeacherAiUsageStats(
  client: Client,
  teacherId: string,
): Promise<AiUsageStats> {
  const rows = await findAiUsageEventsByTeacher(client, teacherId);
  const entries = rows
    .map((row) => parseEventData(row.event_data))
    .filter((data): data is AiUsageEventData => data !== null)
    .map((data) =>
      createAiUsageEntry(
        data.operation,
        data.model,
        data.prompt_tokens,
        data.completion_tokens,
      ),
    );

  return summarizeAiUsageEntries(entries);
}

export async function recordAiUsage(
  client: Client,
  teacherId: string,
  entry: AiUsageEntry | null | undefined,
) {
  if (!entry) return;
  await recordAiUsageEvent(client, teacherId, toEventData(entry));
}
