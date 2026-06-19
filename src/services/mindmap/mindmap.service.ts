import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Adaptation } from "@/types";
import { ApiError } from "@/lib/auth/require-teacher";
import { convertMindmapJsonToMermaid } from "@/lib/mermaid/convert-mindmap-json";
import { detectDiagramType, isValidMermaidStructure } from "@/lib/mermaid/mermaid-utils";
import { generateMermaidFromCourse } from "@/services/ai/mindmap.ai.service";
import { generateDemoMermaid } from "@/services/mindmap/demo-mermaid.service";
import {
  findAdaptationById,
  updateMindmapMermaid,
} from "@/repositories/adaptations.repository";

type Client = SupabaseClient<Database>;

export interface MindmapResponse {
  diagramType: string;
  mermaidCode: string;
}

function buildSourceText(adaptation: Adaptation): string {
  return [
    adaptation.adapted_content,
    adaptation.summary,
    adaptation.memory_sheet,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

async function generateMermaidForAdaptation(
  adaptation: Adaptation,
): Promise<MindmapResponse> {
  const source = buildSourceText(adaptation);

  if (source) {
    try {
      return await generateMermaidFromCourse(source);
    } catch {
      // Fallback si l'IA échoue
    }
  }

  if (adaptation.mindmap) {
    const fromJson = convertMindmapJsonToMermaid(adaptation.mindmap);
    if (fromJson && isValidMermaidStructure(fromJson)) {
      return {
        diagramType: detectDiagramType(fromJson),
        mermaidCode: fromJson,
      };
    }
  }

  return generateDemoMermaid(source || adaptation.summary || "Cours adapté");
}

async function persistMermaid(
  client: Client,
  teacherId: string,
  adaptationId: string,
  mermaidCode: string,
) {
  try {
    await updateMindmapMermaid(client, teacherId, adaptationId, mermaidCode);
  } catch (err) {
    console.warn("[mindmap] Impossible de sauvegarder en base (migration 006 ?):", err);
  }
}

export async function getOrCreateMindmap(
  client: Client,
  teacherId: string,
  adaptationId: string,
): Promise<MindmapResponse> {
  const adaptation = await findAdaptationById(client, teacherId, adaptationId);

  const cached = adaptation.mindmap_mermaid?.trim();
  if (cached && isValidMermaidStructure(cached)) {
    return {
      diagramType: detectDiagramType(cached),
      mermaidCode: cached,
    };
  }

  if (!buildSourceText(adaptation) && !adaptation.mindmap) {
    throw new ApiError("Aucun contenu disponible pour générer le schéma.", 400);
  }

  const generated = await generateMermaidForAdaptation(adaptation);
  await persistMermaid(client, teacherId, adaptationId, generated.mermaidCode);

  return generated;
}
