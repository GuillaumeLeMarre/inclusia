import mammoth from "mammoth";
import type { DocumentFormat } from "@/types";
import type { AllowedExtension } from "@/schemas/document.schema";

export interface ExtractionResult {
  text: string;
  pageCount: number | null;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: DocumentFormat,
): Promise<ExtractionResult> {
  switch (fileType) {
    case "txt":
      return { text: buffer.toString("utf-8"), pageCount: null };
    case "docx":
      return extractDocx(buffer);
    case "pdf":
      return extractPdf(buffer);
    default:
      throw new Error(`Format non supporté : ${fileType}`);
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value.trim(), pageCount: null };
}

async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return {
      text: result.text.trim(),
      pageCount: result.total,
    };
  } finally {
    await parser.destroy();
  }
}

export function inferFileType(ext: AllowedExtension): DocumentFormat {
  return ext;
}

export function deriveTitle(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
}
