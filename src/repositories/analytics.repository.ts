import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { AiUsageEventData } from "@/types/ai-usage";

type Client = SupabaseClient<Database>;

export const AI_USAGE_EVENT_TYPE = "ai_usage";

export async function recordAiUsageEvent(
  client: Client,
  teacherId: string,
  data: AiUsageEventData,
) {
  const { error } = await client.from("analytics_events").insert({
    teacher_id: teacherId,
    event_type: AI_USAGE_EVENT_TYPE,
    event_data: data as unknown as Json,
  });

  if (error) throw error;
}

export async function findAiUsageEventsByTeacher(client: Client, teacherId: string) {
  const { data, error } = await client
    .from("analytics_events")
    .select("event_data")
    .eq("teacher_id", teacherId)
    .eq("event_type", AI_USAGE_EVENT_TYPE);

  if (error) throw error;
  return data ?? [];
}
