import { isSupabaseConfigured } from "@/lib/supabase/env";

export function isDemoMode(): boolean {
  return !process.env.OPENAI_API_KEY;
}

export function getAppConfig() {
  return {
    name: "Inclusia",
    slogan: "L'IA qui adapte l'école à chaque élève",
    isDemoMode: isDemoMode(),
    isSupabaseConfigured: isSupabaseConfigured(),
  };
}
