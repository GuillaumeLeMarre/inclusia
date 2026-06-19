import { z } from "zod";

export const adaptRequestSchema = z.object({
  profileId: z.string().uuid("Profil invalide"),
  documentId: z.string().uuid("Document invalide"),
  profileSlugs: z.array(z.string()).min(1, "Sélectionnez au moins un type d'adaptation"),
  adaptationLevel: z.enum(["standard", "simplified", "falc"]).default("standard"),
  generatePictograms: z.boolean().optional().default(false),
});

export type AdaptRequestInput = z.infer<typeof adaptRequestSchema>;
