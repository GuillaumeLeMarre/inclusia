import { MERMAID_SYSTEM_PROMPT, MERMAID_FALC_SYSTEM_APPEND, buildMindmapUserPrompt } from "@/prompts/mindmap/mindmap.prompt";
import { parseMermaidAiResponse } from "@/lib/mermaid/parse-mermaid-response";
import { inferDiagramTypeFromText } from "@/lib/mermaid/infer-diagram-type";
import { reconcileDiagramType } from "@/lib/mermaid/mermaid-utils";
import { generateDemoMermaid } from "@/services/mindmap/demo-mermaid.service";
import { getOpenAIClient, getOpenAIModel } from "@/services/ai/openai.client";
import type { MermaidGenerationResult } from "@/types/mindmap";

export type { MermaidGenerationResult };

const MAX_OUTPUT_TOKENS = 650;

function getMindmapModel(): string {
  return process.env.OPENAI_MINDMAP_MODEL ?? getOpenAIModel();
}

export async function generateMermaidFromCourse(
  courseText: string,
  options?: { falcMode?: boolean },
): Promise<MermaidGenerationResult> {
  const text = courseText.trim().slice(0, 2400);
  if (!text) {
    throw new Error("Contenu du cours insuffisant pour générer un schéma.");
  }

  const falcMode = options?.falcMode ?? false;
  const openai = getOpenAIClient();
  if (!openai) {
    return generateDemoMermaid(text);
  }

  const suggestedType = inferDiagramTypeFromText(text);
  const systemPrompt = falcMode
    ? MERMAID_SYSTEM_PROMPT + MERMAID_FALC_SYSTEM_APPEND
    : MERMAID_SYSTEM_PROMPT;

  try {
    const response = await openai.chat.completions.create({
      model: getMindmapModel(),
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: buildMindmapUserPrompt(text, suggestedType, { falcMode }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: MAX_OUTPUT_TOKENS,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const parsed = parseMermaidAiResponse(raw);

    if (parsed) {
      return {
        ...parsed,
        diagramType: reconcileDiagramType(parsed.diagramType, parsed.mermaidCode),
      };
    }

    return generateDemoMermaid(text);
  } catch {
    return generateDemoMermaid(text);
  }
}
