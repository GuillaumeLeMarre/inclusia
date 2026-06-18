import { getOpenAIClient, getOpenAIModel } from "@/services/ai/openai.client";
import type { AdaptationOutput } from "@/services/adaptation/demo-adaptation.service";

export async function generateAdaptationWithAI(
  system: string,
  user: string,
): Promise<AdaptationOutput> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OpenAI non configuré");
  }

  const response = await openai.chat.completions.create({
    model: getOpenAIModel(),
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

  return JSON.parse(content) as AdaptationOutput;
}
