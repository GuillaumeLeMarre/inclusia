#!/usr/bin/env node
/**
 * Diagnostique la régénération d'une adaptation.
 * Usage: node --env-file=.env.local scripts/debug-regenerate.mjs <adaptationId> [teacherId]
 */

import { createClient } from "@supabase/supabase-js";

const adaptationId = process.argv[2];
const teacherIdArg = process.argv[3];

if (!adaptationId) {
  console.error("Usage: node --env-file=.env.local scripts/debug-regenerate.mjs <adaptationId>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceRoleKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: adaptation, error } = await admin
  .from("adaptations")
  .select("*, documents(extracted_text, title, status)")
  .eq("id", adaptationId)
  .maybeSingle();

if (error || !adaptation) {
  console.error("Adaptation introuvable:", error?.message);
  process.exit(1);
}

const teacherId = teacherIdArg ?? adaptation.teacher_id;
console.log("teacher_id:", teacherId);
console.log("profile_source:", adaptation.profile_source);
console.log("pedagogical_profile_id:", adaptation.pedagogical_profile_id);
console.log("teacher_profile_id:", adaptation.teacher_profile_id);
console.log("pedagogical_profile_slugs:", adaptation.pedagogical_profile_slugs);
console.log("profile_slugs:", adaptation.profile_slugs);
console.log("adaptation_level:", adaptation.adaptation_level);
console.log("document status:", adaptation.documents?.status);
console.log("extracted_text length:", adaptation.documents?.extracted_text?.length ?? 0);

const slugs = (adaptation.pedagogical_profile_slugs?.length
  ? adaptation.pedagogical_profile_slugs
  : adaptation.profile_slugs) ?? [];

for (const slug of slugs) {
  const { data: profiles, error: slugError } = await admin
    .from("pedagogical_profiles")
    .select("id, slug, is_active")
    .eq("slug", slug);

  if (slugError) {
    console.log(`slug ${slug}: ERROR`, slugError.message, slugError.code);
  } else {
    console.log(`slug ${slug}:`, profiles?.length ? profiles : "absent en DB (fallback possible)");
  }
}

if (adaptation.pedagogical_profile_id && !adaptation.pedagogical_profile_id.includes("+")) {
  const { data: profile, error: idError } = await admin
    .from("pedagogical_profiles")
    .select("id, slug, is_active")
    .eq("id", adaptation.pedagogical_profile_id)
    .maybeSingle();

  if (idError) {
    console.log("pedagogical_profile_id lookup ERROR:", idError.message);
  } else {
    console.log("pedagogical_profile_id lookup:", profile ?? "introuvable");
  }
}
