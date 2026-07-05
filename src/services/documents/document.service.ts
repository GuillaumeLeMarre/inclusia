import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  countAdaptationsForDocument,
  deleteDocument,
  findDocumentById,
} from "@/repositories/documents.repository";
import { getDemoDocumentById } from "@/services/demo/demo-data.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Document } from "@/types";

const BUCKET = "documents";

type Client = SupabaseClient<Database>;

export async function getDocumentForTeacher(
  client: Client,
  teacherId: string,
  documentId: string,
): Promise<Document | null> {
  if (!isSupabaseConfigured()) {
    return getDemoDocumentById(documentId);
  }

  try {
    return await findDocumentById(client, teacherId, documentId);
  } catch {
    return null;
  }
}

export async function getAdaptationCountForDocument(
  client: Client,
  teacherId: string,
  documentId: string,
): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  return countAdaptationsForDocument(client, teacherId, documentId);
}

export async function deleteTeacherDocument(
  client: Client,
  teacherId: string,
  documentId: string,
) {
  if (!isSupabaseConfigured()) {
    throw new Error("Suppression indisponible en mode démo");
  }

  const document = await findDocumentById(client, teacherId, documentId);

  if (document.storage_path) {
    const admin = createAdminClient();
    const { error: storageError } = await admin.storage
      .from(BUCKET)
      .remove([document.storage_path]);

    if (storageError) {
      throw new Error(`Suppression du fichier échouée : ${storageError.message}`);
    }
  }

  await deleteDocument(client, teacherId, documentId);
}

export async function createDocumentFileSignedUrl(
  client: Client,
  teacherId: string,
  documentId: string,
) {
  if (!isSupabaseConfigured()) {
    throw new Error("Fichier indisponible en mode démo");
  }

  const document = await findDocumentById(client, teacherId, documentId);
  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(document.storage_path, 3600);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Impossible de générer le lien de téléchargement");
  }

  return {
    url: data.signedUrl,
    fileName: document.file_name,
    fileType: document.file_type,
  };
}
