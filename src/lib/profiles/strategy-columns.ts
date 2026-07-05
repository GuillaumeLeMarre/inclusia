import type { PedagogicalStrategy } from "@/types/pedagogical-strategy";
import { EMPTY_PEDAGOGICAL_STRATEGY } from "@/types/pedagogical-strategy";
import type {
  PedagogicalDimensions,
  SystemDimensionColumn,
  TeacherCustomDimensions,
  TeacherDimensionColumn,
} from "@/types/pedagogical-dimensions";
import {
  EMPTY_PEDAGOGICAL_DIMENSIONS,
  EMPTY_TEACHER_DIMENSIONS,
  PROFILE_DIMENSION_SECTIONS,
  SYSTEM_COLUMN_TO_STRATEGY_KEY,
  TEACHER_COLUMN_TO_STRATEGY_KEY,
} from "@/types/pedagogical-dimensions";
import { parseProfileRules } from "@/schemas/profile-rules.schema";

function parseRulesArray(raw: unknown): string[] {
  return parseProfileRules(raw);
}

export function dimensionsFromRow(row: Record<string, unknown>): PedagogicalDimensions {
  const hasColumns = PROFILE_DIMENSION_SECTIONS.some(
    (s) => Array.isArray(row[s.systemColumn]),
  );

  if (hasColumns) {
    return {
      pedagogical_objectives: parseRulesArray(row.pedagogical_objectives),
      linguistic_rules: parseRulesArray(row.linguistic_rules),
      layout_rules: parseRulesArray(row.layout_rules),
      structuring_rules: parseRulesArray(row.structuring_rules),
      visual_aids: parseRulesArray(row.visual_aids),
      audio_aids: parseRulesArray(row.audio_aids),
      exercise_adaptations: parseRulesArray(row.exercise_adaptations),
      evaluation_rules: parseRulesArray(row.evaluation_rules),
    };
  }

  const strategy = row.pedagogical_strategy;
  if (strategy && typeof strategy === "object" && !Array.isArray(strategy)) {
    const s = strategy as Record<string, unknown>;
    return {
      pedagogical_objectives: parseRulesArray(s.objectives),
      linguistic_rules: parseRulesArray(s.linguistic_rules),
      layout_rules: parseRulesArray(s.layout_rules),
      structuring_rules: parseRulesArray(s.structure_rules),
      visual_aids: parseRulesArray(s.visual_aids),
      audio_aids: parseRulesArray(s.audio_aids),
      exercise_adaptations: parseRulesArray(s.exercise_adaptations),
      evaluation_rules: parseRulesArray(s.evaluation_rules),
    };
  }

  return { ...EMPTY_PEDAGOGICAL_DIMENSIONS };
}

export function teacherDimensionsFromRow(row: Record<string, unknown>): TeacherCustomDimensions {
  const hasColumns = PROFILE_DIMENSION_SECTIONS.some(
    (s) => Array.isArray(row[s.teacherColumn]),
  );

  if (hasColumns) {
    return {
      custom_pedagogical_objectives: parseRulesArray(row.custom_pedagogical_objectives),
      custom_linguistic_rules: parseRulesArray(row.custom_linguistic_rules),
      custom_layout_rules: parseRulesArray(row.custom_layout_rules),
      custom_structuring_rules: parseRulesArray(row.custom_structuring_rules),
      custom_visual_aids: parseRulesArray(row.custom_visual_aids),
      custom_audio_aids: parseRulesArray(row.custom_audio_aids),
      custom_exercise_adaptations: parseRulesArray(row.custom_exercise_adaptations),
      custom_evaluation_rules: parseRulesArray(row.custom_evaluation_rules),
    };
  }

  const strategy = row.custom_strategy;
  if (strategy && typeof strategy === "object" && !Array.isArray(strategy)) {
    const s = strategy as Record<string, unknown>;
    return {
      custom_pedagogical_objectives: parseRulesArray(s.objectives),
      custom_linguistic_rules: parseRulesArray(s.linguistic_rules),
      custom_layout_rules: parseRulesArray(s.layout_rules),
      custom_structuring_rules: parseRulesArray(s.structure_rules),
      custom_visual_aids: parseRulesArray(s.visual_aids),
      custom_audio_aids: parseRulesArray(s.audio_aids),
      custom_exercise_adaptations: parseRulesArray(s.exercise_adaptations),
      custom_evaluation_rules: parseRulesArray(s.evaluation_rules),
    };
  }

  return { ...EMPTY_TEACHER_DIMENSIONS };
}

export function strategyFromDimensions(
  dimensions: PedagogicalDimensions,
  avoid: string[] = [],
): PedagogicalStrategy {
  return {
    objectives: [...dimensions.pedagogical_objectives],
    linguistic_rules: [...dimensions.linguistic_rules],
    layout_rules: [...dimensions.layout_rules],
    structure_rules: [...dimensions.structuring_rules],
    visual_aids: [...dimensions.visual_aids],
    audio_aids: [...dimensions.audio_aids],
    exercise_adaptations: [...dimensions.exercise_adaptations],
    evaluation_rules: [...dimensions.evaluation_rules],
    avoid: [...avoid],
  };
}

export function strategyFromTeacherDimensions(
  dimensions: TeacherCustomDimensions,
): PedagogicalStrategy {
  return {
    objectives: [...dimensions.custom_pedagogical_objectives],
    linguistic_rules: [...dimensions.custom_linguistic_rules],
    layout_rules: [...dimensions.custom_layout_rules],
    structure_rules: [...dimensions.custom_structuring_rules],
    visual_aids: [...dimensions.custom_visual_aids],
    audio_aids: [...dimensions.custom_audio_aids],
    exercise_adaptations: [...dimensions.custom_exercise_adaptations],
    evaluation_rules: [...dimensions.custom_evaluation_rules],
    avoid: [],
  };
}

export function strategyFromProfileRow(row: Record<string, unknown>): PedagogicalStrategy {
  const dimensions = dimensionsFromRow(row);
  const legacy = row.pedagogical_strategy;
  let avoid: string[] = [];
  if (legacy && typeof legacy === "object" && !Array.isArray(legacy)) {
    avoid = parseRulesArray((legacy as Record<string, unknown>).avoid);
  }
  return strategyFromDimensions(dimensions, avoid);
}

export function strategyJsonFromDimensions(
  dimensions: PedagogicalDimensions,
  existingAvoid: string[] = [],
): PedagogicalStrategy {
  return strategyFromDimensions(dimensions, existingAvoid);
}

export function dimensionsToDbPayload(
  dimensions: Partial<PedagogicalDimensions>,
): Record<SystemDimensionColumn, string[]> {
  const base = { ...EMPTY_PEDAGOGICAL_DIMENSIONS, ...dimensions };
  return {
    pedagogical_objectives: base.pedagogical_objectives,
    linguistic_rules: base.linguistic_rules,
    layout_rules: base.layout_rules,
    structuring_rules: base.structuring_rules,
    visual_aids: base.visual_aids,
    audio_aids: base.audio_aids,
    exercise_adaptations: base.exercise_adaptations,
    evaluation_rules: base.evaluation_rules,
  };
}

export function teacherDimensionsToDbPayload(
  dimensions: Partial<TeacherCustomDimensions>,
): Record<TeacherDimensionColumn, string[]> {
  const base = { ...EMPTY_TEACHER_DIMENSIONS, ...dimensions };
  return {
    custom_pedagogical_objectives: base.custom_pedagogical_objectives,
    custom_linguistic_rules: base.custom_linguistic_rules,
    custom_layout_rules: base.custom_layout_rules,
    custom_structuring_rules: base.custom_structuring_rules,
    custom_visual_aids: base.custom_visual_aids,
    custom_audio_aids: base.custom_audio_aids,
    custom_exercise_adaptations: base.custom_exercise_adaptations,
    custom_evaluation_rules: base.custom_evaluation_rules,
  };
}

export function dimensionsFromStrategy(strategy: PedagogicalStrategy): PedagogicalDimensions {
  return {
    pedagogical_objectives: [...strategy.objectives],
    linguistic_rules: [...strategy.linguistic_rules],
    layout_rules: [...strategy.layout_rules],
    structuring_rules: [...strategy.structure_rules],
    visual_aids: [...strategy.visual_aids],
    audio_aids: [...strategy.audio_aids],
    exercise_adaptations: [...strategy.exercise_adaptations],
    evaluation_rules: [...strategy.evaluation_rules],
  };
}

export function emptyStrategyFromTemplate(): PedagogicalStrategy {
  return { ...EMPTY_PEDAGOGICAL_STRATEGY, avoid: [...(EMPTY_PEDAGOGICAL_STRATEGY.avoid ?? [])] };
}
