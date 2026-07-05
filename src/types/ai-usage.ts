export interface AiUsageEntry {
  operation: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costEur: number;
}

export interface AiUsageStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostEur: number;
  requestCount: number;
}

export interface AiUsageEventData {
  operation: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_eur: number;
}
