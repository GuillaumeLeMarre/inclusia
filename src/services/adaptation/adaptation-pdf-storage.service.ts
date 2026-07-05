import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  buildAdaptationExportFilename,
} from "@/lib/pdf/adaptation-export-filename";
import { resolveExportSchema } from "@/lib/pdf/resolve-export-schema";
import {
  findAdaptationById,
  updateAdaptationPdfPath,
} from "@/repositories/adaptations.repository";
import { buildAdaptationPdfBuffer } from "@/services/adaptation/adaptation-pdf.service";
import { getOrCreateMindmap } from "@/services/mindmap/mindmap.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const BUCKET = "adaptations";
const BUCKET_OPTIONS = {
  public: false,
  fileSizeLimit: 20 * 1024 * 1024,
  allowedMimeTypes: ["application/pdf"] as string[],
};

type Client = SupabaseClient<Database>;

export interface AdaptationPdfPayload {
  pdf: Buffer;
  filename: string;
  storagePath: string | null;
  fromCache: boolean;
}

export interface BuildAdaptationPdfOptions {
  schemaPng?: string | null;
  schemaSvg?: string | null;
}

function getExportContent(
  adaptation: Awaited<ReturnType<typeof findAdaptationById>>,
): string {
  if (adaptation.adaptation_level === "falc" && adaptation.falc_content?.trim()) {
    return adaptation.falc_content;
  }
  return adaptation.adapted_content?.trim() ?? "";
}

export function getAdaptationPdfStoragePath(teacherId: string, adaptationId: string) {
  return `${teacherId}/${adaptationId}.pdf`;
}

async function resolveSchemaForExport(
  client: Client,
  teacherId: string,
  adaptation: Awaited<ReturnType<typeof findAdaptationById>>,
) {
  const cached = resolveExportSchema(adaptation);
  if (cached?.mermaidCode) return cached;

  try {
    return await getOrCreateMindmap(client, teacherId, adaptation.id);
  } catch {
    return null;
  }
}

export async function buildAdaptationPdf(
  client: Client,
  teacherId: string,
  adaptation: Awaited<ReturnType<typeof findAdaptationById>>,
  options: BuildAdaptationPdfOptions = {},
): Promise<Buffer> {
  const content = getExportContent(adaptation);
  if (!content) {
    throw new Error("Aucun contenu adapté à exporter.");
  }

  const isFalc = adaptation.adaptation_level === "falc";
  const title = adaptation.document?.title ?? "Cours adapté";
  const schema = await resolveSchemaForExport(client, teacherId, adaptation);

  return buildAdaptationPdfBuffer(title, content, {
    falcMode: isFalc,
    schema,
    schemaPng: options.schemaPng,
    schemaSvg: options.schemaSvg,
  });
}

async function downloadStoredPdf(storagePath: string): Promise<Buffer | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).download(storagePath);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

async function ensureAdaptationsBucket(): Promise<void> {
  const admin = createAdminClient();
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    throw new Error(`Vérification bucket échouée : ${listError.message}`);
  }

  if (buckets?.some((bucket) => bucket.id === BUCKET || bucket.name === BUCKET)) {
    return;
  }

  const { error: createError } = await admin.storage.createBucket(BUCKET, BUCKET_OPTIONS);
  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(`Création bucket échouée : ${createError.message}`);
  }
}

async function uploadAdaptationPdf(
  teacherId: string,
  adaptationId: string,
  pdf: Buffer,
): Promise<string> {
  await ensureAdaptationsBucket();

  const storagePath = getAdaptationPdfStoragePath(teacherId, adaptationId);
  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).upload(storagePath, pdf, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) {
    if (/bucket not found/i.test(error.message)) {
      await ensureAdaptationsBucket();
      const retry = await admin.storage.from(BUCKET).upload(storagePath, pdf, {
        contentType: "application/pdf",
        upsert: true,
      });
      if (retry.error) {
        throw new Error(`Stockage PDF échoué : ${retry.error.message}`);
      }
      return storagePath;
    }

    throw new Error(`Stockage PDF échoué : ${error.message}`);
  }

  return storagePath;
}

async function persistAdaptationPdfPath(
  client: Client,
  teacherId: string,
  adaptationId: string,
  storagePath: string,
): Promise<boolean> {
  try {
    await updateAdaptationPdfPath(client, teacherId, adaptationId, storagePath);
    return true;
  } catch (err) {
    console.warn(
      "[adaptation-pdf] Colonne pdf_storage_path absente ou mise à jour échouée:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

export async function deleteStoredAdaptationPdf(storagePath: string | null | undefined) {
  if (!storagePath || !isSupabaseConfigured()) return;

  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).remove([storagePath]);
  if (error) {
    console.warn("[adaptation-pdf] Suppression Storage échouée:", error.message);
  }
}

export async function ensureAdaptationPdfStored(
  client: Client,
  teacherId: string,
  adaptationId: string,
  options: BuildAdaptationPdfOptions = {},
): Promise<AdaptationPdfPayload> {
  const adaptation = await findAdaptationById(client, teacherId, adaptationId);
  const filename = buildAdaptationExportFilename(adaptation.document?.title, {
    falcMode: adaptation.adaptation_level === "falc",
  });

  const storageCandidates = [
    adaptation.pdf_storage_path,
    getAdaptationPdfStoragePath(teacherId, adaptationId),
  ].filter((path, index, paths): path is string => Boolean(path) && paths.indexOf(path) === index);

  for (const candidatePath of storageCandidates) {
    const cached = await downloadStoredPdf(candidatePath);
    if (cached) {
      if (!adaptation.pdf_storage_path && candidatePath) {
        await persistAdaptationPdfPath(client, teacherId, adaptationId, candidatePath);
      }
      return {
        pdf: cached,
        filename,
        storagePath: candidatePath,
        fromCache: true,
      };
    }
  }

  const pdf = await buildAdaptationPdf(client, teacherId, adaptation, options);
  let storagePath: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      storagePath = await uploadAdaptationPdf(teacherId, adaptationId, pdf);
      await persistAdaptationPdfPath(client, teacherId, adaptationId, storagePath);
    } catch (err) {
      console.warn("[adaptation-pdf] Stockage PDF ignoré:", err);
      storagePath = null;
    }
  }

  return {
    pdf,
    filename,
    storagePath,
    fromCache: false,
  };
}
