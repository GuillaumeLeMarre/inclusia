import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  FallbackPedagogicalProfileSeed,
  PedagogicalProfile,
  ProfileOptions,
  ResolvedPedagogicalProfile,
} from "@/types/pedagogical-profile";
import { emptyStrategy } from "@/types/pedagogical-profile";
import type { AdaptationLevel } from "@/types/adaptation-level";
import type { PedagogicalStrategy } from "@/types/pedagogical-strategy";
import { DEFAULT_PROFILE_OPTIONS } from "@/types/pedagogical-profile";
import { parsePedagogicalStrategy } from "@/schemas/pedagogical-strategy.schema";
import { strategyToLegacyRulesText } from "@/services/profiles/strategy-prompt.service";
import { PEDAGOGICAL_ADAPTATION_SYSTEM_PROMPT } from "@/prompts/adaptation/pedagogical-profile.prompt";
import {
  dimensionsFromStrategy,
  strategyFromDimensions,
  strategyFromProfileRow,
} from "@/lib/profiles/strategy-columns";
import type { PedagogicalDimensions } from "@/types/pedagogical-dimensions";
import { EMPTY_PEDAGOGICAL_DIMENSIONS } from "@/types/pedagogical-dimensions";

let cachedFallback: FallbackPedagogicalProfileSeed[] | null = null;

function loadFallbackFile(): FallbackPedagogicalProfileSeed[] {
  if (cachedFallback) return cachedFallback;
  const filePath = join(process.cwd(), "seed", "default-pedagogical-profiles.json");
  const raw = readFileSync(filePath, "utf-8");
  cachedFallback = JSON.parse(raw) as FallbackPedagogicalProfileSeed[];
  return cachedFallback;
}

function parseStrategy(raw: unknown): PedagogicalStrategy {
  const parsed = parsePedagogicalStrategy(raw);
  return { ...parsed, avoid: parsed.avoid ?? [] };
}

export function seedDimensionsFromSeed(seed: FallbackPedagogicalProfileSeed): PedagogicalDimensions {
  const hasFlat = (
    Object.keys(EMPTY_PEDAGOGICAL_DIMENSIONS) as (keyof PedagogicalDimensions)[]
  ).some((key) => Array.isArray(seed[key]) && seed[key]!.length > 0);

  if (hasFlat) {
    return {
      pedagogical_objectives: seed.pedagogical_objectives ?? [],
      linguistic_rules: seed.linguistic_rules ?? [],
      layout_rules: seed.layout_rules ?? [],
      structuring_rules: seed.structuring_rules ?? [],
      visual_aids: seed.visual_aids ?? [],
      audio_aids: seed.audio_aids ?? [],
      exercise_adaptations: seed.exercise_adaptations ?? [],
      evaluation_rules: seed.evaluation_rules ?? [],
    };
  }

  if (seed.pedagogical_strategy) {
    return dimensionsFromStrategy(parseStrategy(seed.pedagogical_strategy));
  }

  return { ...EMPTY_PEDAGOGICAL_DIMENSIONS };
}

export function getFallbackProfiles(): FallbackPedagogicalProfileSeed[] {
  return loadFallbackFile();
}

export function getFallbackProfileBySlug(slug: string): FallbackPedagogicalProfileSeed | null {
  return getFallbackProfiles().find((p) => p.slug === slug) ?? null;
}

function buildResolved(
  source: ResolvedPedagogicalProfile["source"],
  profileId: string,
  slug: string,
  name: string,
  systemPrompt: string,
  userPrompt: string,
  strategy: PedagogicalStrategy,
  adaptationLevel: AdaptationLevel,
  options: ProfileOptions,
  customPrompt: string | null = null,
  customRules: string | null = null,
): ResolvedPedagogicalProfile {
  return {
    source,
    profileId,
    slug,
    slugs: [slug],
    name,
    systemPrompt,
    userPrompt,
    pedagogicalRules: strategyToLegacyRulesText(strategy),
    mergedStrategy: strategy,
    customPrompt,
    customRules,
    adaptationLevel,
    options: normalizeOptions(options),
  };
}

export function fallbackToResolved(seed: FallbackPedagogicalProfileSeed): ResolvedPedagogicalProfile {
  const dimensions = seedDimensionsFromSeed(seed);
  const strategy = seed.pedagogical_strategy
    ? parseStrategy(seed.pedagogical_strategy)
    : strategyFromDimensions(dimensions);
  return buildResolved(
    "FALLBACK_PROFILE",
    `fallback:${seed.slug}`,
    seed.slug,
    seed.name,
    seed.system_prompt,
    seed.user_prompt,
    strategy,
    seed.adaptation_level,
    seed.options,
  );
}

export function profileToResolved(profile: PedagogicalProfile): ResolvedPedagogicalProfile {
  return buildResolved(
    "SYSTEM_PROFILE",
    profile.id,
    profile.slug,
    profile.name,
    profile.system_prompt,
    profile.user_prompt,
    profile.pedagogical_strategy,
    profile.adaptation_level,
    profile.options,
  );
}

export function systemProfileToResolved(profile: PedagogicalProfile): ResolvedPedagogicalProfile {
  return profileToResolved(profile);
}

export function normalizeOptions(options: Partial<ProfileOptions> | null | undefined): ProfileOptions {
  return {
    generate_summary: options?.generate_summary ?? DEFAULT_PROFILE_OPTIONS.generate_summary,
    generate_quiz: options?.generate_quiz ?? DEFAULT_PROFILE_OPTIONS.generate_quiz,
    generate_mindmap: options?.generate_mindmap ?? DEFAULT_PROFILE_OPTIONS.generate_mindmap,
    generate_audio: options?.generate_audio ?? DEFAULT_PROFILE_OPTIONS.generate_audio,
    generate_falc: options?.generate_falc ?? DEFAULT_PROFILE_OPTIONS.generate_falc,
  };
}

export function seedToInsertPayload(seed: FallbackPedagogicalProfileSeed) {
  const dimensions = seedDimensionsFromSeed(seed);
  const strategy = seed.pedagogical_strategy
    ? parseStrategy(seed.pedagogical_strategy)
    : strategyFromDimensions(dimensions, parseStrategy(seed.pedagogical_strategy ?? {}).avoid ?? []);

  return {
    slug: seed.slug,
    name: seed.name,
    category: seed.category,
    description: seed.description,
    system_prompt: PEDAGOGICAL_ADAPTATION_SYSTEM_PROMPT,
    user_prompt: "",
    pedagogical_rules: strategyToLegacyRulesText(strategy),
    ...dimensions,
    pedagogical_strategy: strategy,
    adaptation_level: seed.adaptation_level as AdaptationLevel,
    options: normalizeOptions(seed.options),
    is_active: seed.is_active,
    sort_order: seed.sort_order,
  };
}

export function getFallbackStatus() {
  const profiles = getFallbackProfiles();
  return {
    count: profiles.length,
    slugs: profiles.map((p) => p.slug),
    loaded: true,
  };
}

export function fallbackSeedsAsProfiles(): PedagogicalProfile[] {
  return getFallbackProfiles().map((p, index) => {
    const dimensions = seedDimensionsFromSeed(p);
    const strategy = p.pedagogical_strategy
      ? parseStrategy(p.pedagogical_strategy)
      : strategyFromDimensions(dimensions);
    return {
      id: `fallback:${p.slug}`,
      slug: p.slug,
      name: p.name,
      category: p.category,
      description: p.description,
      system_prompt: p.system_prompt,
      user_prompt: p.user_prompt,
      pedagogical_rules: p.pedagogical_rules,
      ...dimensions,
      pedagogical_strategy: strategy,
      adaptation_level: p.adaptation_level,
      options: normalizeOptions(p.options),
      is_active: p.is_active,
      sort_order: p.sort_order ?? index,
      created_at: "",
      updated_at: "",
    };
  });
}

export { strategyFromProfileRow };

export function resetFallbackCache(): void {
  cachedFallback = null;
}
