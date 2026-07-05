import { z } from "zod";

export const MAX_PROFILE_RULES = 50;
export const MAX_PROFILE_RULE_LENGTH = 300;

export const profileRuleItemSchema = z
  .string()
  .trim()
  .min(1, "Règle vide")
  .max(MAX_PROFILE_RULE_LENGTH, `Maximum ${MAX_PROFILE_RULE_LENGTH} caractères par règle`);

export const profileRulesSchema = z
  .array(z.string())
  .max(MAX_PROFILE_RULES, `Maximum ${MAX_PROFILE_RULES} règles par section`)
  .transform((items) =>
    items
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, MAX_PROFILE_RULES),
  )
  .pipe(
    z.array(profileRuleItemSchema).max(MAX_PROFILE_RULES),
  );

export const pedagogicalDimensionsSchema = z.object({
  pedagogical_objectives: profileRulesSchema.default([]),
  linguistic_rules: profileRulesSchema.default([]),
  layout_rules: profileRulesSchema.default([]),
  structuring_rules: profileRulesSchema.default([]),
  visual_aids: profileRulesSchema.default([]),
  audio_aids: profileRulesSchema.default([]),
  exercise_adaptations: profileRulesSchema.default([]),
  evaluation_rules: profileRulesSchema.default([]),
});

export const teacherCustomDimensionsSchema = z.object({
  custom_pedagogical_objectives: profileRulesSchema.default([]),
  custom_linguistic_rules: profileRulesSchema.default([]),
  custom_layout_rules: profileRulesSchema.default([]),
  custom_structuring_rules: profileRulesSchema.default([]),
  custom_visual_aids: profileRulesSchema.default([]),
  custom_audio_aids: profileRulesSchema.default([]),
  custom_exercise_adaptations: profileRulesSchema.default([]),
  custom_evaluation_rules: profileRulesSchema.default([]),
});

export function parseProfileRules(raw: unknown): string[] {
  const parsed = profileRulesSchema.safeParse(Array.isArray(raw) ? raw : []);
  return parsed.success ? parsed.data : [];
}

export function parsePedagogicalDimensions(raw: unknown) {
  const parsed = pedagogicalDimensionsSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : pedagogicalDimensionsSchema.parse({});
}

export function parseTeacherCustomDimensions(raw: unknown) {
  const parsed = teacherCustomDimensionsSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : teacherCustomDimensionsSchema.parse({});
}
