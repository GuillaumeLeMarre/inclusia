import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  deleteAdaptation,
  findAdaptationById,
  findAdaptationsByTeacher,
} from "@/repositories/adaptations.repository";
import { deleteStoredAdaptationPdf } from "@/services/adaptation/adaptation-pdf-storage.service";
import { formatDate } from "@/lib/utils";
import { getProfileName } from "@/lib/constants/profiles";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export interface AdaptationListItem {
  id: string;
  title: string;
  subtitle: string;
  profiles: string[];
  status: string;
  isDemo: boolean;
  createdAt: string;
}

export async function getAdaptationsList(): Promise<AdaptationListItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const rows = await findAdaptationsByTeacher(supabase, user.id);

  return rows.map((row) => {
    const profile = row.learner_profiles as { profile_name: string } | null;
    const doc = row.documents as { title: string } | null;
    const slugs = Array.isArray(row.profile_slugs) ? (row.profile_slugs as string[]) : [];

    return {
      id: row.id,
      title: doc?.title ?? "Document",
      subtitle: profile?.profile_name ?? "Profil",
      profiles: slugs.map(getProfileName),
      status: row.status,
      isDemo: row.is_demo,
      createdAt: formatDate(row.created_at),
    };
  });
}

export async function deleteTeacherAdaptation(
  client: Client,
  teacherId: string,
  adaptationId: string,
) {
  if (!isSupabaseConfigured()) {
    throw new Error("Suppression indisponible en mode démo");
  }

  const adaptation = await findAdaptationById(client, teacherId, adaptationId);
  if (!adaptation) {
    throw new Error("Adaptation introuvable");
  }

  await deleteStoredAdaptationPdf(adaptation.pdf_storage_path);
  await deleteAdaptation(client, teacherId, adaptationId);
}
