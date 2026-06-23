import type { AdaptationLevel } from "@/types/adaptation-level";

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

export interface PedagogicalProfile {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  system_prompt: string;
  user_prompt: string;
  pedagogical_rules: string;
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PedagogicalProfileVersion {
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
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  sort_order: number;
  change_note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TeacherProfile {
  id: string;
  teacher_id: string;
  source_profile_id: string | null;
  name: string;
  description: string | null;
  custom_prompt: string | null;
  custom_rules: string | null;
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfileVersion {
  id: string;
  profile_id: string;
  version: number;
  source_profile_id: string | null;
  name: string;
  description: string | null;
  custom_prompt: string | null;
  custom_rules: string | null;
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
  name: string;
  systemPrompt: string;
  userPrompt: string;
  pedagogicalRules: string;
  customPrompt: string | null;
  customRules: string | null;
  adaptationLevel: AdaptationLevel;
  options: ProfileOptions;
}

export interface FallbackPedagogicalProfileSeed {
  slug: string;
  name: string;
  category: string;
  description: string;
  system_prompt: string;
  user_prompt: string;
  pedagogical_rules: string;
  adaptation_level: AdaptationLevel;
  options: ProfileOptions;
  is_active: boolean;
  sort_order: number;
}
