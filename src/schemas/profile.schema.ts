import { z } from "zod";

export const learnerProfileSchema = z.object({
  profileName: z.string().min(1, "Nom du profil requis").max(80, "Maximum 80 caractères"),
  approximateLevel: z.string().optional(),
  adaptationSlugs: z.array(z.string()).min(1, "Sélectionnez au moins un type d'adaptation"),
  pedagogicalNeeds: z.string().optional(),
  notes: z.string().optional(),
  preferences: z.object({
    audioEnabled: z.boolean(),
    diagramsEnabled: z.boolean(),
    quizEnabled: z.boolean(),
    simplifiedVocab: z.boolean(),
    adaptedFont: z.boolean(),
    simplifiedText: z.boolean(),
  }),
});

export type LearnerProfileInput = z.infer<typeof learnerProfileSchema>;
