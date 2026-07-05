import { PICTOGRAM_CONCEPTS_PROMPT } from "@/prompts/falc/pictogram.prompt";
import { extractPictogramConcepts } from "@/lib/falc/extract-pictogram-concepts";
import { getOpenAIClient, getOpenAIModel } from "@/services/ai/openai.client";
import { extractAiUsageFromCompletion } from "@/services/ai/ai-usage.service";
import type { KeywordItem } from "@/types";
import type { AiUsageEntry } from "@/types/ai-usage";

const MAX_SOURCE_CHARS = 6000;

function parseConceptsJson(raw: string): string[] | null {
  try {
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as { concepts?: unknown };
    if (!Array.isArray(parsed.concepts)) return null;
    return parsed.concepts
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      .map((c) => c.trim().toLowerCase())
      .slice(0, 12);
  } catch {
    return null;
  }
}

export interface PictogramConceptsAiResult {
  concepts: string[];
  usage: AiUsageEntry | null;
}

export async function extractPictogramConceptsWithAI(
  content: string,
  keywords?: KeywordItem[] | null,
): Promise<PictogramConceptsAiResult> {
  const fallback = extractPictogramConcepts(content, keywords);
  const openai = getOpenAIClient();
  if (!openai) {
    return { concepts: fallback, usage: null };
  }

  const text = content.trim().slice(0, MAX_SOURCE_CHARS);
  if (!text) {
    return { concepts: fallback, usage: null };
  }

  try {
    const model = getOpenAIModel();
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: PICTOGRAM_CONCEPTS_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 400,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const concepts = parseConceptsJson(raw);
    const usage = extractAiUsageFromCompletion(response, "pictograms", model);

    if (concepts?.length) {
      return { concepts, usage };
    }

    return { concepts: fallback, usage };
  } catch {
    return { concepts: fallback, usage: null };
  }
}
