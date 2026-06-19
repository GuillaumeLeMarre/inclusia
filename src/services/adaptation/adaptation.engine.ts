import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { findDocumentById } from "@/repositories/documents.repository";
import {
  findLearningPreferences,
  findProfileById,
} from "@/repositories/profiles.repository";
import { createAdaptation } from "@/repositories/adaptations.repository";
import { buildAdaptationPrompt } from "@/prompts/prompt-builder";
import {
  generateDemoAdaptation,
  shouldUseDemoAi,
  type AdaptationOutput,
} from "@/services/adaptation/demo-adaptation.service";
import { generateAdaptationWithAI } from "@/services/ai/adaptation.ai.service";
import { generateFalcFromText } from "@/services/ai/falc.ai.service";
import type { AdaptationLevel } from "@/types/adaptation-level";

export interface RunAdaptationInput {
  teacherId: string;
  profileId: string;
  documentId: string;
  profileSlugs: string[];
  adaptationLevel: AdaptationLevel;
  generatePictograms?: boolean;
}

export async function runAdaptationEngine(
  client: SupabaseClient<Database>,
  input: RunAdaptationInput,
) {
  const start = Date.now();

  const [profile, document, preferences] = await Promise.all([
    findProfileById(client, input.teacherId, input.profileId),
    findDocumentById(client, input.teacherId, input.documentId),
    findLearningPreferences(client, input.profileId),
  ]);

  const sourceText = document.extracted_text?.trim();
  if (!sourceText) {
    throw new Error("Le document n'a pas de texte extractible. Réimportez-le.");
  }

  let slugs = input.profileSlugs.length > 0
    ? input.profileSlugs
    : profile.adaptation_slugs;

  if (input.adaptationLevel === "falc" && !slugs.includes("falc")) {
    slugs = [...slugs, "falc"];
  }

  const { system, user } = await buildAdaptationPrompt({
    profile,
    preferences,
    profileSlugs: slugs,
    sourceText,
    documentTitle: document.title,
    adaptationLevel: input.adaptationLevel,
    supabase: client,
  });

  const isDemo = shouldUseDemoAi();
  let output: AdaptationOutput;

  try {
    output = isDemo
      ? generateDemoAdaptation(profile, document.title, sourceText, slugs)
      : await generateAdaptationWithAI(system, user);
  } catch {
    output = generateDemoAdaptation(profile, document.title, sourceText, slugs);
  }

  let falcContent: string | null = null;
  let falcScore: number | null = null;

  if (input.adaptationLevel === "falc") {
    const falc = await generateFalcFromText(output.adapted_content);
    falcContent = falc.content;
    falcScore = falc.score;
  }

  let mindmapMermaid: string | null = null;

  if (input.adaptationLevel === "falc" && falcContent) {
    try {
      const { generateMermaidFromCourse } = await import("@/services/ai/mindmap.ai.service");
      const { serializeMindmapResult } = await import("@/lib/mermaid/parse-mermaid-response");
      const { injectFalcSchemaSection } = await import("@/lib/falc/inject-falc-schema");

      const schema = await generateMermaidFromCourse(falcContent, { falcMode: true });
      mindmapMermaid = serializeMindmapResult(schema);
      falcContent = injectFalcSchemaSection(falcContent, schema.title);
    } catch (err) {
      console.warn("[falc] Schéma non généré:", err);
    }
  }

  let falcPictograms = null;
  if (input.generatePictograms) {
    try {
      const { generateFalcPictograms } = await import("@/services/falc/falc-pictogram.service");
      const contentForPictograms = falcContent ?? output.adapted_content;
      falcPictograms = await generateFalcPictograms({
        content: contentForPictograms,
        keywords: output.keywords,
        summary: output.summary,
      });
      if (!falcPictograms.items.length) {
        falcPictograms = null;
      }
    } catch (err) {
      console.warn("[pictograms] Génération échouée:", err);
    }
  }

  const processingTimeMs = Date.now() - start;

  return createAdaptation(client, {
    teacherId: input.teacherId,
    profileId: input.profileId,
    documentId: input.documentId,
    profileSlugs: slugs,
    status: isDemo ? "demo" : "completed",
    adaptationLevel: input.adaptationLevel,
    falcScore,
    falcContent,
    generatePictograms: input.generatePictograms ?? false,
    falcPictograms,
    mindmapMermaid,
    adaptedContent: output.adapted_content,
    summary: output.summary,
    memorySheet: output.memory_sheet,
    quiz: output.quiz,
    keywords: output.keywords,
    simplifiedQuestions: output.simplified_questions,
    adaptedInstructions: output.adapted_instructions,
    mindmap: output.mindmap,
    audioScript: output.audio_script,
    processingTimeMs,
    isDemo,
  });
}
