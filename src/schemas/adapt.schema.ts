import { z } from "zod";

export const adaptRequestSchema = z.object({
  profileId: z.string().uuid("Profil apprenant invalide"),
  documentId: z.string().uuid("Document invalide"),
  teacherProfileId: z.string().uuid().optional(),
  pedagogicalProfileId: z.string().uuid().optional(),
  pedagogicalProfileSlug: z.string().optional(),
  profileSlugs: z.array(z.string()).optional().default([]),
  adaptationLevel: z.enum(["standard", "simplified", "falc"]).optional(),
  generatePictograms: z.boolean().optional().default(false),
}).refine(
  (data) =>
    Boolean(data.teacherProfileId)
    || Boolean(data.pedagogicalProfileId)
    || Boolean(data.pedagogicalProfileSlug)
    || (data.profileSlugs?.length ?? 0) > 0,
  { message: "Sélectionnez un profil pédagogique" },
);

export type AdaptRequestInput = z.infer<typeof adaptRequestSchema>;
