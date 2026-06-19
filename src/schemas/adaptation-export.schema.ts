import { z } from "zod";

export const adaptationExportSchema = z.object({
  adaptationId: z.string().uuid("Adaptation invalide"),
  schemaPng: z.string().max(4_000_000).optional(),
  schemaSvg: z.string().max(2_000_000).optional(),
});

export type AdaptationExportInput = z.infer<typeof adaptationExportSchema>;
