import { extractPictogramConceptsWithAI } from "@/services/ai/pictogram.ai.service";
import { searchArasaacPictograms } from "@/services/pictograms/arasaac.provider";
import type { KeywordItem } from "@/types";
import type { FalcPictogramsData } from "@/types/falc";
import type { AiUsageEntry } from "@/types/ai-usage";

export interface GeneratePictogramsInput {
  content: string;
  keywords?: KeywordItem[] | null;
  summary?: string | null;
  locale?: string;
}

export interface GeneratePictogramsResult {
  data: FalcPictogramsData;
  usage: AiUsageEntry | null;
}

export async function generateFalcPictograms(
  input: GeneratePictogramsInput,
): Promise<GeneratePictogramsResult> {
  const locale = input.locale ?? "fr";
  const sourceText = [input.summary, input.content].filter(Boolean).join("\n\n");

  const extracted = await extractPictogramConceptsWithAI(sourceText, input.keywords);
  const items = await searchArasaacPictograms(extracted.concepts, locale);

  return {
    data: {
      items,
      generatedAt: new Date().toISOString(),
      locale,
    },
    usage: extracted.usage,
  };
}
