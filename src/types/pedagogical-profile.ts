import type { AdaptationLevel } from "@/types/adaptation-level";
import type { PedagogicalStrategy } from "@/types/pedagogical-strategy";
import { EMPTY_PEDAGOGICAL_STRATEGY } from "@/types/pedagogical-strategy";
import type {
  PedagogicalDimensions,
  TeacherCustomDimensions,
} from "@/types/pedagogical-dimensions";

export interface ProfileOptions {
  generate_summary: boolean;
  generate_quiz: boolean;
  generate_mindmap: boolean;
  generate_audio: boolean;
  generate_falc: boolean;
}

export const DEFAULT_PROFILE_OPTIONS: ProfileOptions = {
  generate_summary: true,
  generate_quiz: true,
  generate_mindmap: true,
  generate_audio: false,
  generate_falc: false,
};

export type ProfileSource = "TEACHER_PROFILE" | "SYSTEM_PROFILE" | "FALLBACK_PROFILE";

export interface PedagogicalProfile extends PedagogicalDimensions {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  system_prompt: string;
  user_prompt: string;
  pedagogical_rules: string;
  /** Stratégie dérivée (merge / prompt). */
  pedagogical_strategy: PedagogicalStrategy;
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PedagogicalProfileVersion extends PedagogicalDimensions {
  id: string;
  profile_id: string;
  version: number;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  system_prompt: string;
  user_prompt: string;
  pedagogical_rules: string;
  pedagogical_strategy: PedagogicalStrategy;
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  sort_order: number;
  change_note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TeacherProfile extends TeacherCustomDimensions {
  id: string;
  teacher_id: string;
  source_profile_id: string | null;
  name: string;
  description: string | null;
  custom_prompt: string | null;
  custom_rules: string | null;
  custom_strategy: PedagogicalStrategy;
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfileVersion extends TeacherCustomDimensions {
  id: string;
  profile_id: string;
  version: number;
  source_profile_id: string | null;
  name: string;
  description: string | null;
  custom_prompt: string | null;
  custom_rules: string | null;
  custom_strategy: PedagogicalStrategy;
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  change_note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ResolvedPedagogicalProfile {
  source: ProfileSource;
  profileId: string;
  slug: string | null;
  slugs: string[];
  name: string;
  systemPrompt: string;
  userPrompt: string;
  pedagogicalRules: string;
  mergedStrategy: PedagogicalStrategy;
  customPrompt: string | null;
  customRules: string | null;
  adaptationLevel: AdaptationLevel;
  options: ProfileOptions;
}

export interface FallbackPedagogicalProfileSeed extends PedagogicalDimensions {
  slug: string;
  name: string;
  category: string;
  description: string;
  system_prompt: string;
  user_prompt: string;
  pedagogical_rules: string;
  /** Legacy : utilisé si les colonnes plates sont absentes du JSON. */
  pedagogical_strategy?: PedagogicalStrategy;
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  sort_order: number;
}

export function emptyStrategy(): PedagogicalStrategy {
  return { ...EMPTY_PEDAGOGICAL_STRATEGY, avoid: [...(EMPTY_PEDAGOGICAL_STRATEGY.avoid ?? [])] };
}
