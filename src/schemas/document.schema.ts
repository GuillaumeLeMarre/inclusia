import { z } from "zod";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export function getExtension(fileName: string): AllowedExtension | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext && ALLOWED_EXTENSIONS.includes(ext as AllowedExtension)) {
    return ext as AllowedExtension;
  }
  return null;
}
