import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { findDocumentById } from "@/repositories/documents.repository";
import {
  findLearningPreferences,
  findStudentById,
} from "@/repositories/students.repository";
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
  studentId: string;
  documentId: string;
  profileSlugs: string[];
}

export async function runAdaptationEngine(
  client: SupabaseClient<Database>,
  input: RunAdaptationInput,
) {
  const start = Date.now();

  const [student, document, preferences] = await Promise.all([
    findStudentById(client, input.teacherId, input.studentId),
    findDocumentById(client, input.teacherId, input.documentId),
    findLearningPreferences(client, input.studentId),
  ]);

  const sourceText = document.extracted_text?.trim();
  if (!sourceText) {
    throw new Error("Le document n'a pas de texte extractible. Réimportez-le.");
  }

  const profiles = input.profileSlugs.length > 0
    ? input.profileSlugs
    : student.profiles;

  const { system, user } = await buildAdaptationPrompt({
    student,
    preferences,
    profileSlugs: profiles,
    sourceText,
    documentTitle: document.title,
    supabase: client,
  });

  const isDemo = shouldUseDemoAi();
  let output: AdaptationOutput;

  try {
    output = isDemo
      ? generateDemoAdaptation(student, document.title, sourceText, profiles)
      : await generateAdaptationWithAI(system, user);
  } catch {
    output = generateDemoAdaptation(student, document.title, sourceText, profiles);
  }

  const processingTimeMs = Date.now() - start;

  return createAdaptation(client, {
    teacherId: input.teacherId,
    studentId: input.studentId,
    documentId: input.documentId,
    profileSlugs: profiles,
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
