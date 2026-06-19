import { z } from "zod";

export const falcRequestSchema = z.object({
  adaptationId: z.string().uuid("Adaptation invalide"),
  forceRegenerate: z.boolean().optional(),
});

export type FalcRequestInput = z.infer<typeof falcRequestSchema>;

export const falcExportSchema = z.object({
  adaptationId: z.string().uuid("Adaptation invalide"),
  schemaPng: z.string().max(4_000_000).optional(),
  schemaSvg: z.string().max(2_000_000).optional(),
});

export const falcPictogramsRequestSchema = z.object({
  adaptationId: z.string().uuid("Adaptation invalide"),
  forceRegenerate: z.boolean().optional(),
});
