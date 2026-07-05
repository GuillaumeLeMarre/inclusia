import { getOpenAIClient, getOpenAIModel } from "@/services/ai/openai.client";
import { extractAiUsageFromCompletion } from "@/services/ai/ai-usage.service";
import type { AdaptationOutput } from "@/services/adaptation/demo-adaptation.service";
import type { AiUsageEntry } from "@/types/ai-usage";

export interface AdaptationAiResult {
  output: AdaptationOutput;
  usage: AiUsageEntry | null;
}

export async function generateAdaptationWithAI(
  system: string,
  user: string,
): Promise<AdaptationAiResult> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OpenAI non configuré");
  }

  const model = getOpenAIModel();
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Réponse IA vide");
  }

  return {
    output: JSON.parse(content) as AdaptationOutput,
    usage: extractAiUsageFromCompletion(response, "adaptation", model),
  };
}
