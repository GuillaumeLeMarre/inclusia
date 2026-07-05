import { z } from "zod";
import { isAdaptationLevel } from "@/types/adaptation-level";
import { pedagogicalStrategySchema } from "@/schemas/pedagogical-strategy.schema";
import {
  pedagogicalDimensionsSchema,
  teacherCustomDimensionsSchema,
} from "@/schemas/profile-rules.schema";

export const profileOptionsSchema = z.object({
  generate_summary: z.boolean(),
  generate_quiz: z.boolean(),
  generate_mindmap: z.boolean(),
  generate_audio: z.boolean(),
  generate_falc: z.boolean(),
});

export const adaptationLevelSchema = z
  .string()
  .refine(isAdaptationLevel, "Niveau d'adaptation invalide");

export const pedagogicalProfileInputSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug requis")
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Slug : minuscules, chiffres et underscores uniquement"),
  name: z.string().min(2, "Nom requis").max(80),
  category: z.string().min(2).max(40),
  description: z.string().max(500).optional().nullable(),
  system_prompt: z.string().max(8000).optional(),
  user_prompt: z.string().max(4000).optional().default(""),
  pedagogical_rules: z.string().max(4000).optional(),
  pedagogical_strategy: pedagogicalStrategySchema.optional(),
  adaptation_level: adaptationLevelSchema.default("standard"),
  options: profileOptionsSchema.optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(999).default(0),
  change_note: z.string().max(500).optional(),
}).merge(pedagogicalDimensionsSchema);

export const pedagogicalProfilePatchSchema = pedagogicalProfileInputSchema
  .partial()
  .extend({
    change_note: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Aucune modification");

export const teacherProfileInputSchema = z.object({
  name: z.string().min(2, "Nom requis").max(80),
  description: z.string().max(500).optional().nullable(),
  source_profile_id: z.string().uuid().optional().nullable(),
  custom_prompt: z.string().max(4000).optional().nullable(),
  custom_rules: z.string().max(4000).optional().nullable(),
  custom_strategy: pedagogicalStrategySchema.optional(),
  adaptation_level: adaptationLevelSchema.default("standard"),
  options: profileOptionsSchema.optional(),
  is_active: z.boolean().default(true),
  change_note: z.string().max(500).optional(),
}).merge(teacherCustomDimensionsSchema);

export const teacherProfilePatchSchema = teacherProfileInputSchema
  .partial()
  .extend({ change_note: z.string().max(500).optional() })
  .refine((data) => Object.keys(data).length > 0, "Aucune modification");

export const duplicateTeacherProfileSchema = z.object({
  source_profile_id: z.string().uuid().optional(),
  teacher_profile_id: z.string().uuid().optional(),
  name: z.string().min(2).max(80),
}).refine(
  (data) => Boolean(data.source_profile_id || data.teacher_profile_id),
  "Profil source requis",
);

export const profileTestPromptSchema = z.object({
  profile_id: z.string().uuid().optional(),
  teacher_profile_id: z.string().uuid().optional(),
  slug: z.string().optional(),
  source_text: z.string().min(20, "Texte source trop court").max(12000),
}).refine(
  (data) => Boolean(data.profile_id || data.teacher_profile_id || data.slug),
  "Profil requis",
);

export const profileImportSchema = z.object({
  version: z.literal(1),
  exported_at: z.string(),
  profiles: z.array(teacherProfileInputSchema.extend({
    source_slug: z.string().optional(),
  })).min(1).max(50),
});

export type PedagogicalProfileInput = z.infer<typeof pedagogicalProfileInputSchema>;
export type PedagogicalProfilePatch = z.infer<typeof pedagogicalProfilePatchSchema>;
export type TeacherProfileInput = z.infer<typeof teacherProfileInputSchema>;
export type TeacherProfilePatch = z.infer<typeof teacherProfilePatchSchema>;
export type ProfileTestPromptInput = z.infer<typeof profileTestPromptSchema>;
export type ProfileImportPayload = z.infer<typeof profileImportSchema>;
