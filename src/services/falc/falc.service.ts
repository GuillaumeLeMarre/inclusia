import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { ApiError } from "@/lib/auth/require-teacher";
import { findAdaptationById, updateFalcFields } from "@/repositories/adaptations.repository";
import { generateFalcFromText } from "@/services/ai/falc.ai.service";
import type { FalcGenerationResult } from "@/types/falc";

type Client = SupabaseClient<Database>;

export async function getOrGenerateFalc(
  client: Client,
  teacherId: string,
  adaptationId: string,
  forceRegenerate = false,
): Promise<FalcGenerationResult> {
  const adaptation = await findAdaptationById(client, teacherId, adaptationId);

  if (!forceRegenerate && adaptation.falc_content?.trim()) {
    const { validateFalcContent } = await import("@/lib/falc/falc-validator");
    const validation = validateFalcContent(adaptation.falc_content);
    return {
      content: adaptation.falc_content,
      score: adaptation.falc_score ?? validation.score,
      label: validation.label,
      metrics: validation.metrics,
    };
  }

  const source =
    adaptation.adapted_content?.trim()
    || adaptation.summary?.trim()
    || "";

  if (!source) {
    throw new ApiError("Aucun contenu disponible pour générer le FALC.", 400);
  }

  const generated = await generateFalcFromText(source);

  await updateFalcFields(client, teacherId, adaptationId, {
    falc_content: generated.content,
    falc_score: generated.score,
    adaptation_level: "falc",
  });

  return generated;
}
