import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { FalcPictogramsData } from "@/types/falc";
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
  adaptationLevel: Adaptation["adaptation_level"];
  falcScore?: number | null;
  falcContent?: string | null;
  generatePictograms?: boolean;
  falcPictograms?: FalcPictogramsData | null;
  mindmapMermaid?: string | null;
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
  pedagogicalProfileId?: string | null;
  teacherProfileId?: string | null;
  profileSource?: import("@/types/pedagogical-profile").ProfileSource | null;
}

function parseFalcPictograms(value: Json | null): FalcPictogramsData | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as unknown as FalcPictogramsData;
  if (!Array.isArray(data.items)) return null;
  return data;
}

function mapAdaptation(row: Database["public"]["Tables"]["adaptations"]["Row"]): Adaptation {
  return {
    ...row,
    adaptation_level: (row.adaptation_level ?? "standard") as Adaptation["adaptation_level"],
    falc_score: row.falc_score ?? null,
    falc_content: row.falc_content ?? null,
    generate_pictograms: row.generate_pictograms ?? false,
    falc_pictograms: parseFalcPictograms(row.falc_pictograms),
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
      adaptation_level: input.adaptationLevel,
      falc_score: input.falcScore ?? null,
      falc_content: input.falcContent ?? null,
      generate_pictograms: input.generatePictograms ?? false,
      falc_pictograms: (input.falcPictograms ?? null) as unknown as Json,
      mindmap_mermaid: input.mindmapMermaid ?? null,
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
      pedagogical_profile_id: input.pedagogicalProfileId ?? null,
      teacher_profile_id: input.teacherProfileId ?? null,
      profile_source: input.profileSource ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapAdaptation(data);
}

export async function updateMindmapMermaid(
  client: Client,
  teacherId: string,
  adaptationId: string,
  mermaidCode: string,
) {
  const { data, error } = await client
    .from("adaptations")
    .update({ mindmap_mermaid: mermaidCode })
    .eq("id", adaptationId)
    .eq("teacher_id", teacherId)
    .select("mindmap_mermaid")
    .single();

  if (error) throw error;
  return data.mindmap_mermaid;
}

export async function updateFalcFields(
  client: Client,
  teacherId: string,
  adaptationId: string,
  fields: {
    falc_content?: string;
    falc_score?: number;
    adaptation_level?: Adaptation["adaptation_level"];
  },
) {
  const { data, error } = await client
    .from("adaptations")
    .update(fields)
    .eq("id", adaptationId)
    .eq("teacher_id", teacherId)
    .select("falc_content, falc_score, adaptation_level")
    .single();

  if (error) throw error;
  return data;
}

export async function updateFalcPictograms(
  client: Client,
  teacherId: string,
  adaptationId: string,
  pictograms: FalcPictogramsData,
) {
  const { data, error } = await client
    .from("adaptations")
    .update({ falc_pictograms: pictograms as unknown as Json })
    .eq("id", adaptationId)
    .eq("teacher_id", teacherId)
    .select("falc_pictograms")
    .single();

  if (error) throw error;
  return parseFalcPictograms(data.falc_pictograms);
}
