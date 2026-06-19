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

export interface RunAdaptationInput {
  teacherId: string;
  profileId: string;
  documentId: string;
  profileSlugs: string[];
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

  const slugs = input.profileSlugs.length > 0
    ? input.profileSlugs
    : profile.adaptation_slugs;

  const { system, user } = await buildAdaptationPrompt({
    profile,
    preferences,
    profileSlugs: slugs,
    sourceText,
    documentTitle: document.title,
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

  const processingTimeMs = Date.now() - start;

  return createAdaptation(client, {
    teacherId: input.teacherId,
    profileId: input.profileId,
    documentId: input.documentId,
    profileSlugs: slugs,
    status: isDemo ? "demo" : "completed",
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
