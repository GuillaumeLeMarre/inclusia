import type { FalcPictogramItem } from "@/types/falc";

/** Abstractions V2 — audio et schémas interactifs (non implémentés). */

export interface FalcPictogramRequest {
  keyword: string;
  locale?: string;
}

export interface FalcPictogramProvider {
  search(keyword: string, locale?: string): Promise<FalcPictogramItem | null>;
  searchMany(keywords: string[], locale?: string): Promise<FalcPictogramItem[]>;
}

export interface FalcAudioRequest {
  adaptationId: string;
  content: string;
}

export interface FalcAudioProvider {
  synthesize(request: FalcAudioRequest): Promise<{ placeholder: true; message: string }>;
}

export interface FalcInteractiveSchema {
  adaptationId: string;
  mermaidCode: string;
  simplified: boolean;
}

export interface FalcInteractiveSchemaProvider {
  render(schema: FalcInteractiveSchema): Promise<{ placeholder: true; message: string }>;
}
