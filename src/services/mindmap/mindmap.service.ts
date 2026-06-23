import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Adaptation } from "@/types";
import type { MermaidGenerationResult } from "@/types/mindmap";
import { ApiError } from "@/lib/auth/require-teacher";
import { convertMindmapJsonToMermaid } from "@/lib/mermaid/convert-mindmap-json";
import { buildMindmapSourceText } from "@/lib/mermaid/build-mindmap-source";
import { getDiagramTypeLabel } from "@/lib/mermaid/diagram-types";
import { isValidMermaidStructure } from "@/lib/mermaid/mermaid-utils";
import {
  deserializeMindmapResult,
  serializeMindmapResult,
} from "@/lib/mermaid/parse-mermaid-response";
import { normalizeMindmapRootLabel } from "@/lib/mermaid/normalize-mindmap-root-label";
import { generateMermaidFromCourse } from "@/services/ai/mindmap.ai.service";
import { generateDemoMermaid } from "@/services/mindmap/demo-mermaid.service";
import {
  findAdaptationById,
  updateMindmapMermaid,
} from "@/repositories/adaptations.repository";

type Client = SupabaseClient<Database>;

export type MindmapResponse = MermaidGenerationResult;

function buildSourceText(adaptation: Adaptation): string {
  return buildMindmapSourceText(adaptation);
}

async function generateMermaidForAdaptation(
  adaptation: Adaptation,
): Promise<MermaidGenerationResult> {
  const source = buildSourceText(adaptation);
  const falcMode = adaptation.adaptation_level === "falc";

  if (source) {
    try {
      return await generateMermaidFromCourse(source, { falcMode });
    } catch {
      // Fallback ci-dessous
    }
  }

  if (adaptation.mindmap) {
    const fromJson = convertMindmapJsonToMermaid(adaptation.mindmap);
    if (fromJson && isValidMermaidStructure(fromJson)) {
      return {
        diagramType: "concept_map",
        title: "Carte de concepts",
        mermaidCode: fromJson,
        explanation: "Conversion du schéma existant en carte de concepts.",
      };
    }
  }

  return generateDemoMermaid(source || adaptation.summary || "Cours adapté");
}

async function persistMermaid(
  client: Client,
  teacherId: string,
  adaptationId: string,
  result: MermaidGenerationResult,
) {
  try {
    await updateMindmapMermaid(
      client,
      teacherId,
      adaptationId,
      serializeMindmapResult(result),
    );
  } catch (err) {
    console.warn("[mindmap] Impossible de sauvegarder en base (migration 006 ?):", err);
  }
}

export async function getOrCreateMindmap(
  client: Client,
  teacherId: string,
  adaptationId: string,
  forceRegenerate = false,
): Promise<MindmapResponse> {
  const adaptation = await findAdaptationById(client, teacherId, adaptationId);

  if (!forceRegenerate) {
    const cached = adaptation.mindmap_mermaid?.trim();
    if (cached) {
      const stored = deserializeMindmapResult(cached);
      if (stored) {
        return {
          ...stored,
          mermaidCode: normalizeMindmapRootLabel(stored.mermaidCode, stored.title),
        };
      }
    }
  }

  if (!buildSourceText(adaptation) && !adaptation.mindmap) {
    throw new ApiError("Aucun contenu disponible pour générer le schéma.", 400);
  }

  const generated = await generateMermaidForAdaptation(adaptation);
  void persistMermaid(client, teacherId, adaptationId, generated);

  return generated;
}

export { getDiagramTypeLabel };
