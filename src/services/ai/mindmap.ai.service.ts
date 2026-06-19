import { MERMAID_SYSTEM_PROMPT } from "@/prompts/mindmap/mindmap.prompt";
import {
  detectDiagramType,
  isValidMermaidStructure,
  sanitizeMermaidCode,
} from "@/lib/mermaid/mermaid-utils";
import { generateDemoMermaid } from "@/services/mindmap/demo-mermaid.service";
import { getOpenAIClient, getOpenAIModel } from "@/services/ai/openai.client";

export interface MermaidGenerationResult {
  diagramType: string;
  mermaidCode: string;
}

export async function generateMermaidFromCourse(
  courseText: string,
): Promise<MermaidGenerationResult> {
  const text = courseText.trim().slice(0, 8000);
  if (!text) {
    throw new Error("Contenu du cours insuffisant pour générer un schéma.");
  }

  const openai = getOpenAIClient();
  if (!openai) {
    return generateDemoMermaid(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: getOpenAIModel(),
      messages: [
        { role: "system", content: MERMAID_SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const mermaidCode = sanitizeMermaidCode(raw);

    if (!isValidMermaidStructure(mermaidCode)) {
      throw new Error("Réponse IA : diagramme Mermaid invalide.");
    }

    return {
      diagramType: detectDiagramType(mermaidCode),
      mermaidCode,
    };
  } catch {
    return generateDemoMermaid(text);
  }
}
