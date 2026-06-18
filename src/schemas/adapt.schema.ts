import { z } from "zod";

export const adaptRequestSchema = z.object({
  studentId: z.string().uuid("Élève invalide"),
  documentId: z.string().uuid("Document invalide"),
  profileSlugs: z.array(z.string()).min(1, "Sélectionnez au moins un profil"),
});

export type AdaptRequestInput = z.infer<typeof adaptRequestSchema>;
