import { extractPictogramConceptsWithAI } from "@/services/ai/pictogram.ai.service";
import { searchArasaacPictograms } from "@/services/pictograms/arasaac.provider";
import type { KeywordItem } from "@/types";
import type { FalcPictogramsData } from "@/types/falc";

export interface GeneratePictogramsInput {
  content: string;
  keywords?: KeywordItem[] | null;
  summary?: string | null;
  locale?: string;
}

export async function generateFalcPictograms(
  input: GeneratePictogramsInput,
): Promise<FalcPictogramsData> {
  const locale = input.locale ?? "fr";
  const sourceText = [input.summary, input.content].filter(Boolean).join("\n\n");

  const concepts = await extractPictogramConceptsWithAI(sourceText, input.keywords);
  const items = await searchArasaacPictograms(concepts, locale);

  return {
    items,
    generatedAt: new Date().toISOString(),
    locale,
  };
}
