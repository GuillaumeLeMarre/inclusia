import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  FallbackPedagogicalProfileSeed,
  PedagogicalProfile,
  ProfileOptions,
  ResolvedPedagogicalProfile,
} from "@/types/pedagogical-profile";
import type { AdaptationLevel } from "@/types/adaptation-level";
import { DEFAULT_PROFILE_OPTIONS } from "@/types/pedagogical-profile";

let cachedFallback: FallbackPedagogicalProfileSeed[] | null = null;

function loadFallbackFile(): FallbackPedagogicalProfileSeed[] {
  if (cachedFallback) return cachedFallback;
  const filePath = join(process.cwd(), "seed", "default-pedagogical-profiles.json");
  const raw = readFileSync(filePath, "utf-8");
  cachedFallback = JSON.parse(raw) as FallbackPedagogicalProfileSeed[];
  return cachedFallback;
}

export function getFallbackProfiles(): FallbackPedagogicalProfileSeed[] {
  return loadFallbackFile();
}

export function getFallbackProfileBySlug(slug: string): FallbackPedagogicalProfileSeed | null {
  return getFallbackProfiles().find((p) => p.slug === slug) ?? null;
}

export function fallbackToResolved(seed: FallbackPedagogicalProfileSeed): ResolvedPedagogicalProfile {
  return {
    source: "FALLBACK_PROFILE",
    profileId: `fallback:${seed.slug}`,
    slug: seed.slug,
    name: seed.name,
    systemPrompt: seed.system_prompt,
    userPrompt: seed.user_prompt,
    pedagogicalRules: seed.pedagogical_rules,
    customPrompt: null,
    customRules: null,
    adaptationLevel: seed.adaptation_level,
    options: normalizeOptions(seed.options),
  };
}

export function systemProfileToResolved(profile: PedagogicalProfile): ResolvedPedagogicalProfile {
  return {
    source: "SYSTEM_PROFILE",
    profileId: profile.id,
    slug: profile.slug,
    name: profile.name,
    systemPrompt: profile.system_prompt,
    userPrompt: profile.user_prompt,
    pedagogicalRules: profile.pedagogical_rules,
    customPrompt: null,
    customRules: null,
    adaptationLevel: profile.adaptation_level,
    options: normalizeOptions(profile.options),
  };
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
  return {
    slug: seed.slug,
    name: seed.name,
    category: seed.category,
    description: seed.description,
    system_prompt: seed.system_prompt,
    user_prompt: seed.user_prompt,
    pedagogical_rules: seed.pedagogical_rules,
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

/** Réinitialise le cache (tests). */
export function resetFallbackCache(): void {
  cachedFallback = null;
}
