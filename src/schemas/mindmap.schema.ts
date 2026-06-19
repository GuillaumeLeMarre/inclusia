import { z } from "zod";

export const mindmapRequestSchema = z.object({
  adaptationId: z.string().uuid("Adaptation invalide"),
});

export type MindmapRequestInput = z.infer<typeof mindmapRequestSchema>;
