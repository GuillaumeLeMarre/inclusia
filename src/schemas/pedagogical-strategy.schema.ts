import { z } from "zod";

export const pedagogicalStrategySchema = z.object({
  objectives: z.array(z.string()).default([]),
  linguistic_rules: z.array(z.string()).default([]),
  layout_rules: z.array(z.string()).default([]),
  structure_rules: z.array(z.string()).default([]),
  visual_aids: z.array(z.string()).default([]),
  audio_aids: z.array(z.string()).default([]),
  exercise_adaptations: z.array(z.string()).default([]),
  evaluation_rules: z.array(z.string()).default([]),
  avoid: z.array(z.string()).optional(),
});

export type PedagogicalStrategyInput = z.infer<typeof pedagogicalStrategySchema>;

export function parsePedagogicalStrategy(raw: unknown) {
  const parsed = pedagogicalStrategySchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : pedagogicalStrategySchema.parse({});
}
