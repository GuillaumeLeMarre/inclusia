import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type {
  Adaptation,
  KeywordItem,
  MindmapData,
  QuizData,
} from "@/types";

type Client = SupabaseClient<Database>;

export interface AdaptationResultInput {
  teacherId: string;
  profileId: string;
  documentId: string;
  profileSlugs: string[];
  status: Adaptation["status"];
  adaptedContent: string;
  summary: string;
  memorySheet: string;
  quiz: QuizData;
  keywords: KeywordItem[];
  simplifiedQuestions: string[];
  adaptedInstructions: string;
  mindmap: MindmapData;
  audioScript: string;
  processingTimeMs: number;
  isDemo: boolean;
}

function mapAdaptation(row: Database["public"]["Tables"]["adaptations"]["Row"]): Adaptation {
  return {
    ...row,
    profile_slugs: Array.isArray(row.profile_slugs) ? (row.profile_slugs as string[]) : [],
    quiz: row.quiz as QuizData | null,
    keywords: row.keywords as KeywordItem[] | null,
    simplified_questions: Array.isArray(row.simplified_questions)
      ? (row.simplified_questions as string[])
      : null,
    mindmap: row.mindmap as MindmapData | null,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}

export async function findAdaptationsByTeacher(client: Client, teacherId: string) {
  const { data, error } = await client
    .from("adaptations")
    .select("*, learner_profiles(profile_name), documents(title)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function findAdaptationById(client: Client, teacherId: string, id: string) {
  const { data, error } = await client
    .from("adaptations")
    .select("*, learner_profiles(profile_name), documents(title)")
    .eq("id", id)
    .eq("teacher_id", teacherId)
    .single();

  if (error) throw error;
  return {
    ...mapAdaptation(data),
    learnerProfile: data.learner_profiles as { profile_name: string } | null,
    document: data.documents as { title: string } | null,
  };
}

export async function createAdaptation(client: Client, input: AdaptationResultInput) {
  const { data, error } = await client
    .from("adaptations")
    .insert({
      teacher_id: input.teacherId,
      profile_id: input.profileId,
      document_id: input.documentId,
      profile_slugs: input.profileSlugs,
      status: input.status,
      adapted_content: input.adaptedContent,
      summary: input.summary,
      memory_sheet: input.memorySheet,
      quiz: input.quiz as unknown as Json,
      keywords: input.keywords as unknown as Json,
      simplified_questions: input.simplifiedQuestions as unknown as Json,
      adapted_instructions: input.adaptedInstructions,
      mindmap: input.mindmap as unknown as Json,
      audio_script: input.audioScript,
      processing_time_ms: input.processingTimeMs,
      is_demo: input.isDemo,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapAdaptation(data);
}
