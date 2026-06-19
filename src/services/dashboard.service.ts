import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getDemoActivity,
  getDemoDocuments,
  getDemoStats,
  getDemoProfiles,
} from "@/services/demo/demo-data.service";
import type { DashboardStats, Document, RecentActivity, LearnerProfile } from "@/types";

import type { Tables } from "@/types/database";

type AdaptationActivityRow = {
  id: string;
  created_at: string;
  learner_profiles: { profile_name: string } | null;
  documents: { title: string } | null;
};

function mapProfileRow(row: Tables<"learner_profiles">): LearnerProfile {
  return {
    ...row,
    adaptation_slugs: Array.isArray(row.adaptation_slugs)
      ? (row.adaptation_slugs as string[])
      : [],
  };
}

function mapDocumentRow(row: Tables<"documents">): Document {
  return {
    ...row,
    metadata: (row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata))
      ? (row.metadata as Record<string, unknown>)
      : {},
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) return getDemoStats();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getDemoStats();

  const [profiles, documents, adaptations] = await Promise.all([
    supabase.from("learner_profiles").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("adaptations").select("id", { count: "exact", head: true }),
  ]);

  const adaptationsCount = adaptations.count ?? 0;

  return {
    profilesCount: profiles.count ?? 0,
    adaptationsCount,
    documentsCount: documents.count ?? 0,
    estimatedTimeSavedMinutes: adaptationsCount * 20,
  };
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  if (!isSupabaseConfigured()) return getDemoActivity();

  const supabase = await createClient();
  const { data: adaptations } = await supabase
    .from("adaptations")
    .select("id, created_at, learner_profiles(profile_name), documents(title)")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<AdaptationActivityRow[]>();

  if (!adaptations?.length) return getDemoActivity();

  return adaptations.map((a) => {
    const profile = a.learner_profiles;
    const doc = a.documents;
    return {
      id: a.id,
      type: "adaptation" as const,
      title: profile?.profile_name
        ? `Adaptation — ${profile.profile_name}`
        : "Adaptation générée",
      description: doc?.title ?? "Document",
      created_at: a.created_at,
    };
  });
}

export async function getProfiles(): Promise<LearnerProfile[]> {
  if (!isSupabaseConfigured()) return getDemoProfiles();

  const supabase = await createClient();
  const { data } = await supabase
    .from("learner_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) return getDemoProfiles();
  return data.map(mapProfileRow);
}

/** @deprecated Use getProfiles */
export const getStudents = getProfiles;

export async function getDocuments(): Promise<Document[]> {
  if (!isSupabaseConfigured()) return getDemoDocuments();

  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) return getDemoDocuments();
  return data.map(mapDocumentRow);
}
