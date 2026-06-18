import OpenAI from "openai";
import { isDemoMode } from "@/lib/config";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (isDemoMode()) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}
