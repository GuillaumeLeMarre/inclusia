import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { assertSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";

export { isSupabaseConfigured };

export function createClient() {
  const { url, anonKey } = assertSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
