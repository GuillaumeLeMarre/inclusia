import { createClient } from "@supabase/supabase-js";
import { assertServiceRoleEnv } from "@/lib/supabase/env";

export function createAdminClient() {
  const { url, serviceRoleKey } = assertServiceRoleEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
