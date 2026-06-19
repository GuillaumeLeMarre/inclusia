import { FALC_SYSTEM_PROMPT } from "@/prompts/falc/falc-system.prompt";
import { validateFalcContent } from "@/lib/falc/falc-validator";
import { getOpenAIClient, getOpenAIModel } from "@/services/ai/openai.client";
import type { FalcGenerationResult } from "@/types/falc";

const MAX_SOURCE_CHARS = 10000;

function buildDemoFalcContent(source: string): string {
  const sentences = source
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .flatMap((s) => {
      const words = s.trim().split(/\s+/).filter(Boolean);
      if (words.length <= 12) return [words.join(" ")];
      const chunks: string[] = [];
      for (let i = 0; i < words.length; i += 10) {
        chunks.push(words.slice(i, i + 10).join(" "));
      }
      return chunks;
    })
    .filter(Boolean)
    .slice(0, 20);

  return `## Cours en FALC

${sentences.map((s) => `- ${s}`).join("\n")}

### À retenir
- Le texte est découpé en phrases courtes.
- Chaque phrase contient une seule idée.`;
}

export async function generateFalcFromText(sourceText: string): Promise<FalcGenerationResult> {
  const text = sourceText.trim().slice(0, MAX_SOURCE_CHARS);
  if (!text) {
    throw new Error("Contenu insuffisant pour générer du FALC.");
  }

  const openai = getOpenAIClient();
  let content: string;

  if (!openai) {
    content = buildDemoFalcContent(text);
  } else {
    try {
      const response = await openai.chat.completions.create({
        model: getOpenAIModel(),
        messages: [
          { role: "system", content: FALC_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Transforme ce contenu en FALC :\n\n${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });
      content = response.choices[0]?.message?.content?.trim() ?? "";
      if (!content) throw new Error("Réponse FALC vide");
    } catch {
      content = buildDemoFalcContent(text);
    }
  }

  const validation = validateFalcContent(content);
  return {
    content,
    score: validation.score,
    label: validation.label,
    metrics: validation.metrics,
  };
}

export { validateFalcContent } from "@/lib/falc/falc-validator";
