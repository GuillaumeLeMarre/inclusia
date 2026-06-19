import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { ApiError } from "@/lib/auth/require-teacher";
import {
  findAdaptationById,
  updateFalcPictograms,
} from "@/repositories/adaptations.repository";
import { generateFalcPictograms } from "@/services/falc/falc-pictogram.service";
import type { FalcPictogramsData } from "@/types/falc";

type Client = SupabaseClient<Database>;

function getContentForPictograms(adaptation: Awaited<ReturnType<typeof findAdaptationById>>): string {
  if (adaptation.adaptation_level === "falc" && adaptation.falc_content?.trim()) {
    return adaptation.falc_content;
  }
  return adaptation.adapted_content?.trim() ?? "";
}

export async function getOrGenerateFalcPictograms(
  client: Client,
  teacherId: string,
  adaptationId: string,
  forceRegenerate = false,
): Promise<FalcPictogramsData> {
  const adaptation = await findAdaptationById(client, teacherId, adaptationId);

  if (!adaptation.generate_pictograms && !forceRegenerate) {
    throw new ApiError("Les pictogrammes ne sont pas activés pour cette adaptation.", 400);
  }

  if (!forceRegenerate && adaptation.falc_pictograms?.items?.length) {
    return adaptation.falc_pictograms;
  }

  const content = getContentForPictograms(adaptation);
  if (!content) {
    throw new ApiError("Aucun contenu disponible pour générer les pictogrammes.", 400);
  }

  const pictograms = await generateFalcPictograms({
    content,
    keywords: adaptation.keywords,
    summary: adaptation.summary,
  });

  if (!pictograms.items.length) {
    throw new ApiError("Aucun pictogramme trouvé pour ce contenu.", 404);
  }

  await updateFalcPictograms(client, teacherId, adaptationId, pictograms);
  return pictograms;
}
