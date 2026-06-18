import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Document, DocumentFormat } from "@/types";

type Client = SupabaseClient<Database>;

function mapDocument(row: Database["public"]["Tables"]["documents"]["Row"]): Document {
  return {
    ...row,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}

export async function findDocumentsByTeacher(client: Client, teacherId: string) {
  const { data, error } = await client
    .from("documents")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDocument);
}

export async function findDocumentById(client: Client, teacherId: string, documentId: string) {
  const { data, error } = await client
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("teacher_id", teacherId)
    .single();

  if (error) throw error;
  return mapDocument(data);
}

export async function createDocument(
  client: Client,
  input: {
    teacherId: string;
    title: string;
    fileName: string;
    fileType: DocumentFormat;
    fileSize: number;
    storagePath: string;
    extractedText: string | null;
    pageCount?: number | null;
    status: Document["status"];
  },
) {
  const { data, error } = await client
    .from("documents")
    .insert({
      teacher_id: input.teacherId,
      title: input.title,
      file_name: input.fileName,
      file_type: input.fileType,
      file_size: input.fileSize,
      storage_path: input.storagePath,
      extracted_text: input.extractedText,
      page_count: input.pageCount ?? null,
      status: input.status,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapDocument(data);
}

export async function updateDocumentStatus(
  client: Client,
  documentId: string,
  teacherId: string,
  updates: Partial<Pick<Document, "status" | "extracted_text" | "page_count">>,
) {
  const { data, error } = await client
    .from("documents")
    .update(updates)
    .eq("id", documentId)
    .eq("teacher_id", teacherId)
    .select("*")
    .single();

  if (error) throw error;
  return mapDocument(data);
}
