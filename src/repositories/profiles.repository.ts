import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { LearnerProfile } from "@/types";

type Client = SupabaseClient<Database>;

function mapLearnerProfile(
  row: Database["public"]["Tables"]["learner_profiles"]["Row"],
): LearnerProfile {
  return {
    ...row,
    adaptation_slugs: Array.isArray(row.adaptation_slugs)
      ? (row.adaptation_slugs as string[])
      : [],
  };
}

export async function findProfilesByTeacher(client: Client, teacherId: string) {
  const { data, error } = await client
    .from("learner_profiles")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapLearnerProfile);
}

export async function findProfileById(
  client: Client,
  teacherId: string,
  profileId: string,
) {
  const { data, error } = await client
    .from("learner_profiles")
    .select("*")
    .eq("id", profileId)
    .eq("teacher_id", teacherId)
    .single();

  if (error) throw error;
  return mapLearnerProfile(data);
}

export async function findLearningPreferences(client: Client, profileId: string) {
  const { data, error } = await client
    .from("learning_preferences")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (error) return null;
  return data;
}
